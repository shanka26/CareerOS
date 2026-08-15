import { describe, expect, it } from "vitest";

import { aggregateJobSearch } from "./aggregate";
import type { JobSearchProvider, JobSearchResult } from "./types";

const result: JobSearchResult = {
  id: "one", source: "one", sourceLabel: "One", title: "Senior TypeScript Engineer", company: "Acme",
  location: "Remote", remote: true, description: "Build AWS services with TypeScript", url: "https://example.com/job",
  postedAt: "2026-08-01T00:00:00.000Z", employmentType: "Full-time", salaryMin: 120000, salaryMax: 150000,
  salaryCurrency: "USD", matchedSkills: [], matchScore: 0,
};

function provider(overrides: Partial<JobSearchProvider>): JobSearchProvider {
  return { id: "one", label: "One", enabled: true, search: async () => [result], ...overrides };
}

describe("aggregateJobSearch", () => {
  it("keeps partial results when another provider fails and deduplicates listings", async () => {
    const response = await aggregateJobSearch({
      query: { q: "TypeScript Engineer", location: "", remote: "any" }, verifiedSkills: ["TypeScript", "AWS"],
      providers: [provider({}), provider({ id: "duplicate", label: "Duplicate" }), provider({ id: "broken", label: "Broken", search: async () => { throw new Error("offline"); } })],
    });

    expect(response.results).toHaveLength(1);
    expect(response.results[0]).toMatchObject({ matchScore: 100, matchedSkills: ["TypeScript", "AWS"] });
    expect(response.providers.find(({ id }) => id === "broken")?.status).toBe("error");
  });

  it("reports providers that require configuration without calling them", async () => {
    const search = async () => { throw new Error("should not run"); };
    const response = await aggregateJobSearch({
      query: { q: "engineer", location: "", remote: "any" }, verifiedSkills: [],
      providers: [provider({ enabled: false, unavailableMessage: "Configure credentials.", search })],
    });
    expect(response.providers[0]).toMatchObject({ status: "unavailable", message: "Configure credentials." });
  });

  it("surfaces multiple successful sources near the top of ranked results", async () => {
    const response = await aggregateJobSearch({
      query: { q: "engineer", location: "", remote: "any" }, verifiedSkills: [],
      providers: [
        provider({ id: "arbeitnow", label: "Arbeitnow", search: async () => [
          { ...result, id: "a1", source: "arbeitnow", matchScore: 0 },
          { ...result, id: "a2", source: "arbeitnow", title: "Engineer Two", url: "https://example.com/a2", matchScore: 0 },
        ] }),
        provider({ id: "remoteok", label: "Remote OK", search: async () => [
          { ...result, id: "r1", source: "remoteok", company: "Other", url: "https://example.com/r1", matchScore: 0 },
        ] }),
      ],
    });

    expect(response.results.slice(0, 2).map(({ source }) => source)).toEqual(["arbeitnow", "remoteok"]);
  });
});
