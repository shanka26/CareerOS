import "server-only";

import type { ResumeFileKind } from "./file-policy";

const MAX_EXTRACTED_CHARACTERS = 100_000;

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
    await installPdfNodeGlobals();
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: bytes });
    try {
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  } else {
    const { default: mammoth } = await import("mammoth");
    text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  }

  const normalized = text.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  if (!normalized) throw new Error("No readable text was found. Scanned resumes require OCR, which is not yet supported.");
  return normalized.slice(0, MAX_EXTRACTED_CHARACTERS);
}
