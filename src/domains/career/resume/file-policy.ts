export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export type ResumeFileKind = "pdf" | "doc" | "docx";

export function detectResumeFileKind(bytes: Uint8Array, name: string): ResumeFileKind | null {
  const lowerName = name.toLowerCase();
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (lowerName.endsWith(".pdf") && isPdf) return "pdf";

  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2] ?? -1);
  if (lowerName.endsWith(".docx") && isZip) return "docx";

  const isLegacyWord = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
    .every((byte, index) => bytes[index] === byte);
  if (lowerName.endsWith(".doc") && isLegacyWord) return "doc";
  return null;
}

export function validateResumeFile(bytes: Uint8Array, name: string): ResumeFileKind {
  if (bytes.byteLength === 0) throw new Error("The resume file is empty.");
  if (bytes.byteLength > MAX_RESUME_BYTES) throw new Error("Resume files must be 5 MB or smaller.");
  const kind = detectResumeFileKind(bytes, name);
  if (!kind) throw new Error("Upload a valid PDF, DOC, or DOCX file. The file contents must match its extension.");
  return kind;
}
