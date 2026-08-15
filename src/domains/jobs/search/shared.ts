import type { JobSearchQuery, JobSearchResult } from "./types";

const maxResponseBytes = 2_000_000;

export async function fetchProviderJson(
  url: URL,
  signal: AbortSignal,
  headers?: HeadersInit,
  revalidateSeconds?: number,
) {
  return fetchProviderJsonRequest(url, signal, headers ? { headers } : {}, revalidateSeconds);
}

export async function fetchProviderJsonRequest(
  url: URL,
  signal: AbortSignal,
  init: RequestInit = {},
  revalidateSeconds?: number,
) {
  const headers = new Headers({ accept: "application/json", "user-agent": "CareerOS Job Search/1.0" });
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  const response = await fetch(url, {
    ...init,
    cache: revalidateSeconds ? "force-cache" : "no-store",
    headers,
    ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : {}),
    signal,
  });
  if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}.`);
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxResponseBytes) throw new Error("Provider response was too large.");
  const text = await response.text();
  if (Buffer.byteLength(text, "utf8") > maxResponseBytes) throw new Error("Provider response was too large.");
  return JSON.parse(text) as unknown;
}

export function plainText(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(result: JobSearchResult, query: JobSearchQuery) {
  const terms = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${result.title} ${result.company} ${result.description}`.toLowerCase();
  const matchedTerms = terms.filter((term) => haystack.includes(term)).length;
  const requiredTerms = Math.max(1, Math.ceil(Math.min(terms.length, 4) / 2));
  if (matchedTerms < requiredTerms) return false;
  if (query.location && !`${result.location} ${result.description}`.toLowerCase().includes(query.location.toLowerCase())) return false;
  if (query.remote === "remote" && !result.remote) return false;
  if (query.remote === "onsite" && result.remote) return false;
  return true;
}

export function scoreResult(result: JobSearchResult, query: JobSearchQuery, verifiedSkills: string[]) {
  const title = result.title.toLowerCase();
  const searchable = `${result.title} ${result.description}`.toLowerCase();
  const queryTerms = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  const titleMatches = queryTerms.filter((term) => title.includes(term)).length;
  const matchedSkills = verifiedSkills.filter((skill) => searchable.includes(skill.toLowerCase())).slice(0, 12);
  const queryScore = queryTerms.length ? titleMatches / queryTerms.length : 0;
  const skillScore = verifiedSkills.length ? matchedSkills.length / Math.min(verifiedSkills.length, 12) : 0;
  return {
    ...result,
    matchedSkills,
    matchScore: Math.min(100, Math.round(queryScore * 60 + skillScore * 40)),
  };
}
