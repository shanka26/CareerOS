import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";

import { transcribeResumeFile } from "./transcribe-file";

describe("AI-assisted resume text recognition", () => {
  it("sends PDFs as high-detail, no-store file inputs", async () => {
    const create = vi.fn().mockResolvedValue({ output_text: "Ada Lovelace\nMathematician" });
    const bytes = new TextEncoder().encode("%PDF-1.7\nfixture");

    const text = await transcribeResumeFile("user-123", bytes, "pdf", { responses: { create } } as never);

    expect(text).toContain("Ada Lovelace");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      store: false,
      safety_identifier: expect.stringMatching(/^[a-f0-9]{64}$/),
      input: [expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({ type: "input_file", filename: "resume.pdf", detail: "high" }),
        ]),
      })],
    }));
  });

  it("includes embedded DOCX images when local extraction needs help", async () => {
    const document = new JSZip();
    document.file("word/media/page.png", new Uint8Array([0x89, 0x50, 0x4e, 0x47]));
    const bytes = await document.generateAsync({ type: "uint8array" });
    const create = vi.fn().mockResolvedValue({ output_text: "Image resume text" });

    await transcribeResumeFile("user-123", bytes, "docx", { responses: { create } } as never);

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      input: [expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({ type: "input_file", filename: "resume.docx" }),
          expect.objectContaining({ type: "input_image", image_url: expect.stringMatching(/^data:image\/png;base64,/) }),
        ]),
      })],
    }));
  });
});
