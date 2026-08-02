import { describe, expect, it } from "vitest";
import {
  assertGroundedDocument,
  buildGenerationFactCatalog,
} from "./ai-document-generation";

describe("AI document generation grounding", () => {
  const catalog = buildGenerationFactCatalog(
    {
      name: "Ada",
      skills: [{ id: "skill-1", name: "TypeScript" }],
      experiences: [{ id: "experience-1", company: "Acme", title: "Engineer", description: "Built tools" }],
    },
    { title: "Lead Engineer", company: "Beta", description: "Build reliable products" },
  );

  it("catalogs verified career facts and imported job context with stable IDs", () => {
    expect(catalog.map((fact) => fact.id)).toEqual(expect.arrayContaining([
      "profile:name",
      "skill-1",
      "experience-1",
      "job:title",
      "job:company",
      "job:description",
    ]));
  });

  it("rejects an explanation that cites a fact outside the catalog", () => {
    expect(() => assertGroundedDocument({
      markdown: "# Ada",
      explanations: [{ what: "Added a claim", why: "Relevant", factIds: ["invented"] }],
    }, catalog)).toThrow("unverified or unknown");
  });
});
