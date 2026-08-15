import { describe, expect, it } from "vitest";

import { diversifyResults } from "./diversify";
import type { JobSearchResult } from "./types";

function result(id: string, source: string, matchScore: number): JobSearchResult {
  return {
    id, source, sourceLabel: source, title: id, company: "Company", location: "Remote", remote: true,
    description: "Description", url: `https://example.com/${id}`, postedAt: null, employmentType: null,
    salaryMin: null, salaryMax: null, salaryCurrency: null, matchedSkills: [], matchScore,
  };
}

describe("diversifyResults", () => {
  it("interleaves sources while preserving each source's relevance order", () => {
    const diversified = diversifyResults([
      result("a1", "arbeitnow", 100), result("a2", "arbeitnow", 95), result("a3", "arbeitnow", 90),
      result("r1", "remoteok", 88), result("r2", "remoteok", 70), result("j1", "jobicy", 80),
    ]);

    expect(diversified.map(({ id }) => id)).toEqual(["a1", "r1", "j1", "a2", "r2", "a3"]);
  });
});
