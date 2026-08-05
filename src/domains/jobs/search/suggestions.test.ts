import { describe, expect, it } from "vitest";

import { buildJobSearchSuggestions } from "./suggestions";

describe("buildJobSearchSuggestions", () => {
  it("prioritizes the target role and verified skills without inventing terms", () => {
    expect(buildJobSearchSuggestions({
      targetRole: "Platform Engineer", headline: "Software professional",
      skills: ["TypeScript", "AWS", "TypeScript"], experienceTitles: ["Backend Engineer"],
    })).toEqual({
      keywords: ["Platform Engineer", "Backend Engineer", "TypeScript", "AWS"],
      prompts: ["Platform Engineer", "Platform Engineer TypeScript", "Platform Engineer AWS", "TypeScript AWS"],
    });
  });
});
