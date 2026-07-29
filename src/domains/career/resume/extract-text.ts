import "server-only";

import type { ResumeFileKind } from "./file-policy";

const MAX_EXTRACTED_CHARACTERS = 100_000;

export async function extractResumeText(bytes: Uint8Array, kind: ResumeFileKind) {
  let text: string;
  if (kind === "pdf") {
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
