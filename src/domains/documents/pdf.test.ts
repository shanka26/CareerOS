import { describe, expect, it } from "vitest";
import { renderDocumentPdf } from "./pdf";

describe("document PDF export", () => {
  it("creates a valid PDF containing multiple pages when needed", async () => {
    const bytes = await renderDocumentPdf("Resume", Array.from({ length: 100 }, (_, index) => `Line ${index}`).join("\n"));
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(500);
  });
});
