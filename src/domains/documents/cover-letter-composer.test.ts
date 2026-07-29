import { describe, expect, it } from "vitest";
import { composeVerifiedCoverLetter } from "./cover-letter-composer";

describe("cover letter composer", () => {
  it("references the role, company, and supplied experience", () => {
    const result = composeVerifiedCoverLetter(
      {
        name: "Ada",
        skills: [],
        experiences: [
          {
            id: "e1",
            company: "Acme",
            title: "Engineer",
            description: "built compilers",
          },
        ],
      },
      { title: "Lead", company: "Beta" },
    );

    expect(result.markdown).toContain("Beta");
    expect(result.markdown).toContain("Lead");
    expect(result.markdown).toContain("built compilers");
    expect(result.explanations[0]?.factIds).toEqual(["e1"]);
  });
});
