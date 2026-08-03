import { PDFDocument, StandardFonts } from "pdf-lib";
import { afterEach, describe, expect, it, vi } from "vitest";

import { extractResumeText } from "./extract-text";

afterEach(() => vi.unstubAllGlobals());

describe("resume text extraction", () => {
  it("extracts a PDF in a Node runtime without browser DOM geometry globals", async () => {
    vi.stubGlobal("DOMMatrix", undefined);
    vi.stubGlobal("ImageData", undefined);
    vi.stubGlobal("Path2D", undefined);

    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const page = document.addPage();
    page.drawText("Ada Lovelace - Software Engineer", { font, x: 48, y: 720 });

    const text = await extractResumeText(await document.save(), "pdf");

    expect(text).toContain("Ada Lovelace");
    expect(globalThis.DOMMatrix).toBeTypeOf("function");
  });

  it("does not expose parser internals for an unreadable PDF", async () => {
    const malformedPdf = new TextEncoder().encode("%PDF-1.7\nmalformed");

    await expect(extractResumeText(malformedPdf, "pdf")).rejects.toThrow(
      "We could not read this PDF. Re-export it as a text-based PDF or upload the DOCX version.",
    );
  });
});
