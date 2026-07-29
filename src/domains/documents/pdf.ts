import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function renderDocumentPdf(title: string, markdown: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 744;
  page.drawText(clean(title), { x: 54, y, size: 18, font: bold, color: rgb(0.09, 0.14, 0.11) });
  y -= 34;
  for (const rawLine of markdown.split("\n")) {
    const chunks = wrap(clean(rawLine.replace(/^#{1,6}\s*/, "")), 88);
    for (const line of chunks.length ? chunks : [""]) {
      if (y < 54) { page = pdf.addPage([612, 792]); y = 744; }
      page.drawText(line, { x: 54, y, size: 10.5, font, color: rgb(0.15, 0.18, 0.16) });
      y -= 15;
    }
  }
  return pdf.save();
}

function clean(value: string) { return value.replace(/[^\x20-\x7E]/g, "?"); }
function wrap(value: string, width: number) {
  if (!value) return [];
  const result: string[] = [];
  let line = "";
  for (const word of value.split(/\s+/)) {
    if (`${line} ${word}`.trim().length > width) { if (line) result.push(line); line = word; } else line = `${line} ${word}`.trim();
  }
  if (line) result.push(line);
  return result;
}
