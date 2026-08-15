import { afterEach, describe, expect, it, vi } from "vitest";

import { createJobSearchProviders } from "./providers";

afterEach(() => vi.restoreAllMocks());

const query = { q: "software engineer", location: "", remote: "any" } as const;

describe("job search providers", () => {
  it("normalizes and attributes Arbeitnow listings", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ data: [{
      slug: "software-engineer", company_name: "Acme", title: "Software Engineer",
      description: "<p>Build reliable products</p>", remote: true, url: "https://www.arbeitnow.com/jobs/software-engineer",
      tags: ["typescript"], job_types: ["Full-time"], location: "Berlin", created_at: 1_785_520_000,
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createJobSearchProviders({ adzunaCountry: "us" }).find(({ id }) => id === "arbeitnow-de");

    const results = await provider!.search(query, AbortSignal.timeout(1_000));

    expect(results[0]).toMatchObject({ sourceLabel: "Arbeitnow Germany", title: "Software Engineer", description: "Build reliable products", remote: true });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).toEqual([
      expect.stringContaining("page=1"), expect.stringContaining("page=2"), expect.stringContaining("page=3"),
    ]);
  });

  it("adds attributed Jobicy remote listings without credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ jobs: [{
      id: 7, url: "https://jobicy.com/jobs/platform-engineer", jobTitle: "Platform Engineer",
      companyName: "Example", jobGeo: "USA", jobDescription: "Build distributed software systems",
      pubDate: "2026-08-12T00:00:00Z", jobType: "Full-time", salaryMin: 130000,
      salaryMax: 160000, salaryCurrency: "USD",
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createJobSearchProviders({ adzunaCountry: "us" }).find(({ id }) => id === "jobicy");

    const results = await provider!.search(query, AbortSignal.timeout(1_000));

    expect(provider?.enabled).toBe(true);
    expect(results[0]).toMatchObject({ sourceLabel: "Jobicy", title: "Platform Engineer", remote: true, salaryMin: 130000 });
    expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ cache: "force-cache", next: { revalidate: 3600 } }));
  });

  it("adds attributed Remote OK listings and ignores its legal metadata row", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([
      { last_updated: 1_786_637_165, legal: "Link directly and mention Remote OK." },
      {
        id: "1136594", position: "Senior Data Engineer", company: "Lemon.io", location: "Worldwide",
        description: "Build remote software platforms with Python", url: "https://remoteok.com/remote-jobs/1136594",
        epoch: 1_786_637_165, tags: ["engineer", "full time"], salary_min: 120000, salary_max: 160000,
      },
    ]), { headers: { "content-type": "application/json" } }));
    const provider = createJobSearchProviders({ adzunaCountry: "us" }).find(({ id }) => id === "remoteok");

    const results = await provider!.search(query, AbortSignal.timeout(1_000));

    expect(provider?.enabled).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ sourceLabel: "Remote OK", title: "Senior Data Engineer", remote: true, salaryMin: 120000 });
    expect(fetch).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ cache: "force-cache", next: { revalidate: 3600 } }));
  });

  it("keeps credentialed providers disabled until both required values exist", () => {
    const providers = createJobSearchProviders({ adzunaCountry: "us", adzunaAppId: "id" });

    expect(providers.find(({ id }) => id === "adzuna")?.enabled).toBe(false);
    expect(providers.find(({ id }) => id === "usajobs")?.enabled).toBe(false);
    expect(providers.find(({ id }) => id === "muse")?.enabled).toBe(false);
  });

  it("normalizes Adzuna salaries and filters remote-only searches", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ results: [{
      id: "42", title: "Software Engineer", description: "Work remotely on TypeScript",
      redirect_url: "https://www.adzuna.com/details/42", created: "2026-08-01T00:00:00Z",
      salary_min: 120000, salary_max: 150000, contract_time: "full_time",
      company: { display_name: "Acme" }, location: { display_name: "Remote" },
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createJobSearchProviders({ adzunaCountry: "us", adzunaAppId: "id", adzunaAppKey: "key" }).find(({ id }) => id === "adzuna");

    const results = await provider!.search({ ...query, remote: "remote" }, AbortSignal.timeout(1_000));

    expect(results[0]).toMatchObject({ salaryMin: 120000, salaryMax: 150000, salaryCurrency: "USD", remote: true });
  });
});
