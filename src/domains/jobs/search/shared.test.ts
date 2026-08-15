import { describe, expect, it } from "vitest";

import { matchesQuery } from "./shared";
import type { JobSearchResult } from "./types";

const job: JobSearchResult = {
  id: "one", source: "source", sourceLabel: "Source", title: "Platform Engineer", company: "Acme",
  location: "Chicago, Illinois", remote: false, description: "Build reliable distributed systems with TypeScript",
  url: "https://example.com/job", postedAt: null, employmentType: "Full-time", salaryMin: null,
  salaryMax: null, salaryCurrency: null, matchedSkills: [], matchScore: 0,
};

describe("job search matching", () => {
  it("keeps relevant partial matches for multi-word searches", () => {
    expect(matchesQuery(job, { q: "senior software platform engineer", location: "", remote: "any" })).toBe(true);
  });

  it("still rejects weak and filter-incompatible results", () => {
    expect(matchesQuery(job, { q: "marketing designer", location: "", remote: "any" })).toBe(false);
    expect(matchesQuery(job, { q: "platform engineer", location: "Boston", remote: "any" })).toBe(false);
    expect(matchesQuery(job, { q: "platform engineer", location: "", remote: "remote" })).toBe(false);
  });
});
