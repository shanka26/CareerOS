import { z } from "zod";

import { fetchProviderJson, matchesQuery, plainText } from "./shared";
import type { JobSearchProvider, JobSearchResult } from "./types";

function isoDate(value: string | number | undefined) {
  if (value == null) return null;
  const date = new Date(typeof value === "number" ? value * 1_000 : value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function finiteNumber(value: string | undefined) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

const arbeitnowSchema = z.object({
  data: z.array(z.object({
    slug: z.string(), company_name: z.string(), title: z.string(), description: z.string(),
    remote: z.boolean().catch(false), url: z.url(), tags: z.array(z.string()).catch([]),
    job_types: z.array(z.string()).catch([]), location: z.string().catch("Location not listed"),
    created_at: z.coerce.number().optional(),
  }).passthrough()).catch([]),
}).passthrough();

function arbeitnowProvider(id: string, label: string, endpoint: string): JobSearchProvider {
  return {
    id, label, enabled: true,
    async search(query, signal) {
      const payload = arbeitnowSchema.parse(await fetchProviderJson(new URL(endpoint), signal));
      return payload.data.map((job): JobSearchResult => ({
        id: `${id}:${job.slug}`, source: id, sourceLabel: label, title: job.title,
        company: job.company_name, location: job.location, remote: job.remote,
        description: plainText(job.description).slice(0, 4_000), url: job.url,
        postedAt: isoDate(job.created_at),
        employmentType: job.job_types[0] ?? null, salaryMin: null, salaryMax: null,
        salaryCurrency: null, matchedSkills: [], matchScore: 0,
      })).filter((job) => matchesQuery(job, query)).slice(0, 25);
    },
  };
}

const adzunaSchema = z.object({ results: z.array(z.object({
  id: z.union([z.string(), z.number()]), title: z.string(), description: z.string().catch(""),
  redirect_url: z.url(), created: z.string().optional(), salary_min: z.number().optional(),
  salary_max: z.number().optional(), contract_type: z.string().optional(), contract_time: z.string().optional(),
  company: z.object({ display_name: z.string() }).optional(),
  location: z.object({ display_name: z.string() }).optional(),
}).passthrough()).catch([]) }).passthrough();

function adzunaProvider(config: SearchProviderConfig): JobSearchProvider {
  const enabled = Boolean(config.adzunaAppId && config.adzunaAppKey);
  return {
    id: "adzuna", label: "Adzuna", enabled,
    unavailableMessage: "Add ADZUNA_APP_ID and ADZUNA_APP_KEY to enable Adzuna.",
    async search(query, signal) {
      const url = new URL(`https://api.adzuna.com/v1/api/jobs/${config.adzunaCountry}/search/1`);
      url.search = new URLSearchParams({ app_id: config.adzunaAppId!, app_key: config.adzunaAppKey!, results_per_page: "25", what: query.q, ...(query.location ? { where: query.location } : {}), "content-type": "application/json" }).toString();
      const payload = adzunaSchema.parse(await fetchProviderJson(url, signal));
      return payload.results.map((job): JobSearchResult => ({
        id: `adzuna:${job.id}`, source: "adzuna", sourceLabel: "Adzuna", title: plainText(job.title),
        company: job.company?.display_name ?? "Company not listed", location: job.location?.display_name ?? "Location not listed",
        remote: /remote/i.test(`${job.location?.display_name ?? ""} ${job.description}`), description: plainText(job.description).slice(0, 4_000),
        url: job.redirect_url, postedAt: isoDate(job.created),
        employmentType: job.contract_time ?? job.contract_type ?? null, salaryMin: job.salary_min ?? null,
        salaryMax: job.salary_max ?? null, salaryCurrency: config.adzunaCountry === "us" ? "USD" : null,
        matchedSkills: [], matchScore: 0,
      })).filter((job) => matchesQuery(job, query));
    },
  };
}

const museSchema = z.object({ results: z.array(z.object({
  id: z.number(), name: z.string(), contents: z.string().catch(""), publication_date: z.string().optional(),
  company: z.object({ name: z.string() }), locations: z.array(z.object({ name: z.string() })).catch([]),
  levels: z.array(z.object({ name: z.string() })).catch([]), refs: z.object({ landing_page: z.url() }),
}).passthrough()).catch([]) }).passthrough();

function museProvider(config: SearchProviderConfig): JobSearchProvider {
  return {
    id: "muse", label: "The Muse", enabled: Boolean(config.museApiKey),
    unavailableMessage: "Add THE_MUSE_API_KEY after registering the CareerOS application with The Muse.",
    async search(query, signal) {
      const url = new URL("https://www.themuse.com/api/public/jobs");
      url.search = new URLSearchParams({ page: "0", api_key: config.museApiKey! }).toString();
      const payload = museSchema.parse(await fetchProviderJson(url, signal));
      return payload.results.map((job): JobSearchResult => ({
        id: `muse:${job.id}`, source: "muse", sourceLabel: "The Muse", title: job.name,
        company: job.company.name, location: job.locations.map(({ name }) => name).join(", ") || "Location not listed",
        remote: job.locations.some(({ name }) => /remote|flexible/i.test(name)), description: plainText(job.contents).slice(0, 4_000),
        url: job.refs.landing_page, postedAt: isoDate(job.publication_date),
        employmentType: job.levels[0]?.name ?? null, salaryMin: null, salaryMax: null, salaryCurrency: null,
        matchedSkills: [], matchScore: 0,
      })).filter((job) => matchesQuery(job, query)).slice(0, 25);
    },
  };
}

const usaJobsSchema = z.object({ SearchResult: z.object({ SearchResultItems: z.array(z.object({
  MatchedObjectId: z.union([z.string(), z.number()]), MatchedObjectDescriptor: z.object({
    PositionTitle: z.string(), PositionURI: z.url(), PositionLocationDisplay: z.string().catch("Location not listed"),
    OrganizationName: z.string().catch("U.S. Government"), QualificationSummary: z.string().catch(""),
    PublicationStartDate: z.string().optional(), PositionSchedule: z.array(z.object({ Name: z.string() })).catch([]),
    PositionRemuneration: z.array(z.object({ MinimumRange: z.coerce.string().optional(), MaximumRange: z.coerce.string().optional() })).catch([]),
    UserArea: z.object({ Details: z.object({ JobSummary: z.string().catch(""), MajorDuties: z.union([z.string().transform((value) => [value]), z.array(z.string())]).catch([]) }).passthrough() }).optional(),
  }).passthrough(),
}).passthrough()).catch([]) }).passthrough() }).passthrough();

function usaJobsProvider(config: SearchProviderConfig): JobSearchProvider {
  const enabled = Boolean(config.usaJobsApiKey && config.usaJobsUserAgent);
  return {
    id: "usajobs", label: "USAJOBS", enabled,
    unavailableMessage: "Add USAJOBS_API_KEY and USAJOBS_USER_AGENT after registering with USAJOBS.",
    async search(query, signal) {
      const url = new URL("https://data.usajobs.gov/api/search");
      url.search = new URLSearchParams({ Keyword: query.q, ResultsPerPage: "25", WhoMayApply: "Public", Fields: "Full", ...(query.location ? { LocationName: query.location } : {}), ...(query.remote === "remote" ? { RemoteIndicator: "True" } : query.remote === "onsite" ? { RemoteIndicator: "False" } : {}) }).toString();
      const payload = usaJobsSchema.parse(await fetchProviderJson(url, signal, { "authorization-key": config.usaJobsApiKey!, "user-agent": config.usaJobsUserAgent! }));
      return payload.SearchResult.SearchResultItems.map(({ MatchedObjectId, MatchedObjectDescriptor: job }): JobSearchResult => {
        const pay = job.PositionRemuneration[0];
        const description = plainText([job.QualificationSummary, job.UserArea?.Details.JobSummary, ...(job.UserArea?.Details.MajorDuties ?? [])].filter(Boolean).join(" ")).slice(0, 4_000);
        return { id: `usajobs:${MatchedObjectId}`, source: "usajobs", sourceLabel: "USAJOBS", title: job.PositionTitle,
          company: job.OrganizationName, location: job.PositionLocationDisplay, remote: /remote/i.test(`${job.PositionLocationDisplay} ${description}`),
          description, url: job.PositionURI, postedAt: isoDate(job.PublicationStartDate),
          employmentType: job.PositionSchedule[0]?.Name ?? null, salaryMin: finiteNumber(pay?.MinimumRange),
          salaryMax: finiteNumber(pay?.MaximumRange), salaryCurrency: "USD", matchedSkills: [], matchScore: 0 };
      });
    },
  };
}

export interface SearchProviderConfig {
  adzunaAppId?: string | undefined;
  adzunaAppKey?: string | undefined;
  adzunaCountry: string;
  usaJobsApiKey?: string | undefined;
  usaJobsUserAgent?: string | undefined;
  museApiKey?: string | undefined;
}

export function createJobSearchProviders(config: SearchProviderConfig): JobSearchProvider[] {
  return [
    arbeitnowProvider("arbeitnow-de", "Arbeitnow Germany", "https://www.arbeitnow.com/api/job-board-api"),
    arbeitnowProvider("arbeitnow-uk", "Arbeitnow UK", "https://www.arbeitnow.co.uk/api/job-board-api"),
    adzunaProvider(config), usaJobsProvider(config), museProvider(config),
  ];
}
