import { describe, expect, it } from "vitest";

import { buildConservativeResumeDraft } from "./draft";

describe("conservative resume draft", () => {
  it("extracts bounded explicit skill-section values", () => {
    const draft = buildConservativeResumeDraft("Ada Lovelace\nStaff Engineer\nada@example.com\n\nSkills\nTypeScript, PostgreSQL | React\n\nExperience\nAnalytical Engines");
    expect(draft.headline).toBe("Staff Engineer");
    expect(draft.skills).toEqual(["TypeScript", "PostgreSQL", "React"]);
    expect(draft.questions.length).toBeGreaterThan(0);
  });

  it("does not invent a headline or skills", () => {
    const draft = buildConservativeResumeDraft("Ada Lovelace\nada@example.com");
    expect(draft.headline).toBeNull();
    expect(draft.skills).toEqual([]);
  });
});
