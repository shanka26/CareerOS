import "server-only";

import type { ResumeFileKind } from "./file-policy";

const MAX_EXTRACTED_CHARACTERS = 100_000;
const MAX_DOCX_XML_BYTES = 10 * 1024 * 1024;

const DOCX_TEXT_PART = /^word\/(?:document|header\d+|footer\d+|footnotes|endnotes)\.xml$/i;

function normalizeExtractedText(text: string) {
  return text.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}

function decodeXmlText(value: string) {
  return value.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity, code: string) => {
    const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
    const normalizedCode = code.toLowerCase();
    if (normalizedCode in named) return named[normalizedCode] ?? entity;

    const point = normalizedCode.startsWith("#x")
      ? Number.parseInt(normalizedCode.slice(2), 16)
      : Number.parseInt(normalizedCode.slice(1), 10);
    return Number.isSafeInteger(point) && point >= 0 && point <= 0x10ffff
      ? String.fromCodePoint(point)
      : entity;
  });
}

function extractTextFromWordXml(xml: string) {
  const chunks: string[] = [];
  const tokens = xml.matchAll(
    /<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t\s*>|<(?:[\w.-]+:)?tab\b[^>]*\/>|<(?:[\w.-]+:)?(?:br|cr)\b[^>]*\/>|<\/(?:[\w.-]+:)?(?:p|tc|tr)\s*>/gi,
  );

  for (const token of tokens) {
    if (token[1] !== undefined) chunks.push(decodeXmlText(token[1]));
    else if (/\btab\b/i.test(token[0])) chunks.push("\t");
    else chunks.push("\n");
  }
  return normalizeExtractedText(chunks.join(""));
}

async function extractDocxXmlFallback(bytes: Uint8Array) {
  const { default: JSZip } = await import("jszip");
  const archive = await JSZip.loadAsync(Buffer.from(bytes));
  const parts = Object.values(archive.files)
    .filter((part) => !part.dir && DOCX_TEXT_PART.test(part.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  const extracted: string[] = [];
  let totalXmlBytes = 0;
  for (const part of parts) {
    const xml = await part.async("string");
    totalXmlBytes += Buffer.byteLength(xml);
    if (totalXmlBytes > MAX_DOCX_XML_BYTES) {
      throw new Error("The DOCX contains too much expanded document data to process safely.");
    }
    const text = extractTextFromWordXml(xml);
    if (text) extracted.push(text);
  }
  return extracted.join("\n");
}

async function extractDocxText(bytes: Uint8Array) {
  try {
    const { default: mammoth } = await import("mammoth");
    const text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
    if (normalizeExtractedText(text)) return text;
  } catch {
    // Some valid Word layouts are unsupported by Mammoth. The OOXML fallback
    // below can still recover text from their document parts.
  }

  try {
    return await extractDocxXmlFallback(bytes);
  } catch (cause) {
    throw new Error("We could not read this DOCX. Re-export it as a standard DOCX or a text-based PDF.", { cause });
  }
}

async function installPdfNodeGlobals() {
  const canvas = await import("@napi-rs/canvas");

  // PDF.js evaluates DOMMatrix during module initialization. Next.js route
  // handlers do not provide browser geometry globals, so install the native
  // Node implementations before importing pdf-parse.
  Object.assign(globalThis, {
    DOMMatrix: globalThis.DOMMatrix ?? canvas.DOMMatrix,
    ImageData: globalThis.ImageData ?? canvas.ImageData,
    Path2D: globalThis.Path2D ?? canvas.Path2D,
  });
}

export async function extractResumeText(bytes: Uint8Array, kind: ResumeFileKind) {
  let text: string;
  if (kind === "pdf") {
    try {
      await installPdfNodeGlobals();
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: bytes });
      try {
        text = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } catch (cause) {
      throw new Error("We could not read this PDF. Re-export it as a text-based PDF or upload the DOCX version.", { cause });
    }
  } else {
    text = await extractDocxText(bytes);
  }

  const normalized = normalizeExtractedText(text);
  if (!normalized) {
    throw new Error(
      "No readable text was found. If this resume contains scanned pages or images, export a text-based DOCX or PDF; OCR is not yet supported.",
    );
  }
  return normalized.slice(0, MAX_EXTRACTED_CHARACTERS);
}
