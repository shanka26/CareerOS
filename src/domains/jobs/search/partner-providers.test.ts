import { afterEach, describe, expect, it, vi } from "vitest";

import { createPartnerJobSearchProviders } from "./partner-providers";

afterEach(() => vi.restoreAllMocks());

const query = { q: "platform engineer", location: "Chicago", remote: "any" } as const;

describe("partner job search providers", () => {
  it("keeps partner APIs visible but disabled until credentials are configured", () => {
    const providers = createPartnerJobSearchProviders({ careerjetLocaleCode: "en_US" });

    expect(providers.map(({ id, enabled }) => ({ id, enabled }))).toEqual([
      { id: "jooble", enabled: false },
      { id: "reed", enabled: false },
      { id: "careerjet", enabled: false },
    ]);
  });

  it("normalizes Jooble results and retains the underlying publisher attribution", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ jobs: [{
      id: 42, title: "Platform Engineer", location: "Chicago", snippet: "Build platform software",
      salary: "120,000 - 150,000 USD", source: "ExampleJobs", type: "Full-time",
      link: "https://jooble.org/jdp/42", company: "Acme", updated: "2026-08-14T00:00:00Z",
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createPartnerJobSearchProviders({ joobleApiKey: "secret" }).find(({ id }) => id === "jooble")!;

    const results = await provider.search(query, AbortSignal.timeout(1_000));

    expect(results[0]).toMatchObject({
      source: "jooble", sourceLabel: "Jooble · ExampleJobs", title: "Platform Engineer",
      salaryMin: 120000, salaryMax: 150000, salaryCurrency: "USD",
    });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: "POST", cache: "no-store" });
  });

  it("normalizes Reed results and uses basic authentication", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ results: [{
      jobId: 7, employerName: "Acme", jobTitle: "Platform Engineer", locationName: "Chicago",
      jobDescription: "Build platform software", minimumSalary: 110000, maximumSalary: 140000,
      currency: "USD", date: "2026-08-13T00:00:00Z", jobUrl: "https://www.reed.co.uk/jobs/7",
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createPartnerJobSearchProviders({ reedApiKey: "reed-key" }).find(({ id }) => id === "reed")!;

    const results = await provider.search(query, AbortSignal.timeout(1_000));

    expect(results[0]).toMatchObject({ sourceLabel: "Reed", salaryMin: 110000, salaryCurrency: "USD" });
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("authorization")).toMatch(/^Basic /);
  });

  it("enables Careerjet only with credentials and required request metadata", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ type: "JOBS", jobs: [{
      title: "Platform Engineer", company: "Acme", date: "2026-08-12T00:00:00Z",
      description: "Build platform software", locations: "Chicago", salary_currency_code: "USD",
      salary_min: 125000, salary_max: 155000, url: "https://jobviewtrack.com/42",
    }] }), { headers: { "content-type": "application/json" } }));
    const provider = createPartnerJobSearchProviders({
      careerjetApiKey: "careerjet-key", careerjetLocaleCode: "en_US", userIp: "203.0.113.10", userAgent: "CareerOS test",
    }).find(({ id }) => id === "careerjet")!;

    const results = await provider.search(query, AbortSignal.timeout(1_000));

    expect(provider.enabled).toBe(true);
    expect(results[0]).toMatchObject({ sourceLabel: "Careerjet", salaryMax: 155000 });
    const requestUrl = new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get("user_ip")).toBe("203.0.113.10");
    expect(requestUrl.searchParams.get("user_agent")).toBe("CareerOS test");
  });
});
