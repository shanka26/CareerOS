import { z } from "zod";

import { fetchProviderJson, fetchProviderJsonRequest, matchesQuery, plainText } from "./shared";
import type { JobSearchProvider, JobSearchResult } from "./types";

export interface PartnerProviderConfig {
  joobleApiKey?: string | undefined;
  reedApiKey?: string | undefined;
  careerjetApiKey?: string | undefined;
  careerjetLocaleCode?: string | undefined;
  userIp?: string | undefined;
  userAgent?: string | undefined;
}

function isoDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function searchKeywords(query: { q: string; remote: "any" | "remote" | "onsite" }) {
  return query.remote === "remote" ? `${query.q} remote` : query.q;
}

function salaryParts(value: string | undefined) {
  const numbers = value?.match(/[\d,.]+/g)?.map((part) => Number(part.replace(/,/g, ""))).filter(Number.isFinite) ?? [];
  const currency = value?.match(/\b[A-Z]{3}\b/)?.[0] ?? null;
  return { minimum: numbers[0] ?? null, maximum: numbers[1] ?? numbers[0] ?? null, currency };
}

const joobleSchema = z.object({
  jobs: z.array(z.object({
    id: z.union([z.string(), z.number()]), title: z.string(), location: z.string().catch("Location not listed"),
    snippet: z.string().catch(""), salary: z.string().optional(), source: z.string().catch("Jooble"),
    type: z.string().optional(), link: z.url(), company: z.string().catch("Company not listed"),
    updated: z.string().optional(),
  }).passthrough()).catch([]),
}).passthrough();

function joobleProvider(config: PartnerProviderConfig): JobSearchProvider {
  return {
    id: "jooble", label: "Jooble", enabled: Boolean(config.joobleApiKey),
    unavailableMessage: "Add JOOBLE_API_KEY after registering for the Jooble REST API.",
    async search(query, signal) {
      const payloads = await Promise.all([1, 2, 3].map((page) => fetchProviderJsonRequest(
        new URL(`https://jooble.org/api/${config.joobleApiKey}`),
        signal,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            keywords: searchKeywords(query), location: query.location, radius: "80", page: String(page),
            ResultOnPage: "50", companysearch: "false",
          }),
        },
      ).then((payload) => joobleSchema.parse(payload))));

      return payloads.flatMap(({ jobs }) => jobs).map((job): JobSearchResult => {
        const salary = salaryParts(job.salary);
        const description = plainText(job.snippet).slice(0, 4_000);
        return {
          id: `jooble:${job.id}`, source: "jooble",
          sourceLabel: /^jooble$/i.test(job.source) ? "Jooble" : `Jooble · ${plainText(job.source)}`,
          title: plainText(job.title), company: plainText(job.company), location: plainText(job.location),
          remote: /remote|work from home/i.test(`${job.location} ${description}`), description, url: job.link,
          postedAt: isoDate(job.updated), employmentType: job.type ?? null,
          salaryMin: salary.minimum, salaryMax: salary.maximum, salaryCurrency: salary.currency,
          matchedSkills: [], matchScore: 0,
        };
      }).filter((job) => matchesQuery(job, query)).slice(0, 120);
    },
  };
}

const reedSchema = z.object({
  results: z.array(z.object({
    jobId: z.union([z.string(), z.number()]), employerName: z.string().catch("Company not listed"),
    jobTitle: z.string(), locationName: z.string().catch("Location not listed"), jobDescription: z.string().catch(""),
    minimumSalary: z.coerce.number().nullable().optional(), maximumSalary: z.coerce.number().nullable().optional(),
    currency: z.string().optional(), date: z.string().optional(), jobUrl: z.url().optional(),
  }).passthrough()).catch([]),
}).passthrough();

function reedProvider(config: PartnerProviderConfig): JobSearchProvider {
  return {
    id: "reed", label: "Reed", enabled: Boolean(config.reedApiKey),
    unavailableMessage: "Add REED_API_KEY after registering for the Reed Jobseeker API.",
    async search(query, signal) {
      const authorization = `Basic ${Buffer.from(`${config.reedApiKey}:`).toString("base64")}`;
      const payloads = await Promise.all([0, 100, 200].map((resultsToSkip) => {
        const url = new URL("https://www.reed.co.uk/api/1.0/search");
        url.search = new URLSearchParams({
          keywords: searchKeywords(query), ...(query.location ? { locationName: query.location } : {}),
          resultsToTake: "100", resultsToSkip: String(resultsToSkip),
        }).toString();
        return fetchProviderJson(url, signal, { authorization }).then((payload) => reedSchema.parse(payload));
      }));

      return payloads.flatMap(({ results }) => results).map((job): JobSearchResult => {
        const description = plainText(job.jobDescription).slice(0, 4_000);
        return {
          id: `reed:${job.jobId}`, source: "reed", sourceLabel: "Reed", title: plainText(job.jobTitle),
          company: plainText(job.employerName), location: plainText(job.locationName),
          remote: /remote|work from home/i.test(`${job.locationName} ${description}`), description,
          url: job.jobUrl ?? `https://www.reed.co.uk/jobs/${job.jobId}`,
          postedAt: isoDate(job.date), employmentType: null,
          salaryMin: job.minimumSalary ?? null, salaryMax: job.maximumSalary ?? null,
          salaryCurrency: job.currency ?? "GBP", matchedSkills: [], matchScore: 0,
        };
      }).filter((job) => matchesQuery(job, query)).slice(0, 150);
    },
  };
}

const careerjetSchema = z.object({
  type: z.string().catch("JOBS"),
  jobs: z.array(z.object({
    title: z.string(), company: z.string().catch("Company not listed"), date: z.string().optional(),
    description: z.string().catch(""), locations: z.string().catch("Location not listed"),
    salary_currency_code: z.string().optional(), salary_min: z.coerce.number().nullable().optional(),
    salary_max: z.coerce.number().nullable().optional(), url: z.url(),
  }).passthrough()).catch([]),
}).passthrough();

function careerjetProvider(config: PartnerProviderConfig): JobSearchProvider {
  const enabled = Boolean(config.careerjetApiKey && config.userIp && config.userAgent);
  return {
    id: "careerjet", label: "Careerjet", enabled,
    unavailableMessage: config.careerjetApiKey
      ? "Careerjet requires request IP and user-agent metadata that was unavailable for this search."
      : "Add CAREERJET_API_KEY after registering a Careerjet Publisher account.",
    async search(query, signal) {
      const authorization = `Basic ${Buffer.from(`${config.careerjetApiKey}:`).toString("base64")}`;
      const payloads = await Promise.all([1, 2, 3].map((page) => {
        const url = new URL("https://search.api.careerjet.net/v4/query");
        url.search = new URLSearchParams({
          locale_code: config.careerjetLocaleCode ?? "en_US", keywords: searchKeywords(query),
          ...(query.location ? { location: query.location } : {}), page: String(page), page_size: "100",
          user_ip: config.userIp!, user_agent: config.userAgent!,
        }).toString();
        return fetchProviderJson(url, signal, { authorization }).then((payload) => careerjetSchema.parse(payload));
      }));

      return payloads.flatMap(({ type, jobs }) => type === "JOBS" ? jobs : []).map((job, index): JobSearchResult => {
        const description = plainText(job.description).slice(0, 4_000);
        return {
          id: `careerjet:${job.url}:${index}`, source: "careerjet", sourceLabel: "Careerjet",
          title: plainText(job.title), company: plainText(job.company), location: plainText(job.locations),
          remote: /remote|work from home/i.test(`${job.locations} ${description}`), description, url: job.url,
          postedAt: isoDate(job.date), employmentType: null,
          salaryMin: job.salary_min ?? null, salaryMax: job.salary_max ?? null,
          salaryCurrency: job.salary_currency_code ?? null, matchedSkills: [], matchScore: 0,
        };
      }).filter((job) => matchesQuery(job, query)).slice(0, 150);
    },
  };
}

export function createPartnerJobSearchProviders(config: PartnerProviderConfig): JobSearchProvider[] {
  return [joobleProvider(config), reedProvider(config), careerjetProvider(config)];
}
