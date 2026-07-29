import { describe, expect, it } from "vitest";

import { detectResumeFileKind, validateResumeFile } from "./file-policy";

describe("resume upload policy", () => {
  it("requires extension and magic bytes to agree", () => {
    expect(detectResumeFileKind(new Uint8Array([0x25, 0x50, 0x44, 0x46]), "resume.pdf")).toBe("pdf");
    expect(detectResumeFileKind(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), "resume.docx")).toBe("docx");
    expect(detectResumeFileKind(new Uint8Array([0x25, 0x50, 0x44, 0x46]), "resume.docx")).toBeNull();
  });

  it("rejects empty and disguised files", () => {
    expect(() => validateResumeFile(new Uint8Array(), "resume.pdf")).toThrow("empty");
    expect(() => validateResumeFile(new TextEncoder().encode("not a document"), "resume.pdf")).toThrow("valid PDF or DOCX");
  });
});
