import JSZip from "jszip";
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

  it("extracts text from DOCX parts that Mammoth does not traverse", async () => {
    const document = new JSZip();
    document.file(
      "[Content_Types].xml",
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    );
    document.file(
      "_rels/.rels",
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    );
    document.file(
      "word/document.xml",
      '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p/><w:sectPr/></w:body></w:document>',
    );
    document.file(
      "word/header1.xml",
      '<?xml version="1.0"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>Truth &amp; Betts</w:t></w:r></w:p><w:p><w:r><w:t>Software Engineer</w:t></w:r></w:p></w:hdr>',
    );

    const text = await extractResumeText(await document.generateAsync({ type: "uint8array" }), "docx");

    expect(text).toContain("Truth & Betts");
    expect(text).toContain("Software Engineer");
  });
});
