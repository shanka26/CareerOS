import { scoreResult } from "./shared";
import type { JobSearchProvider, JobSearchProviderStatus, JobSearchQuery, JobSearchResult } from "./types";

function dedupeKey(job: JobSearchResult) {
  return `${job.title}|${job.company}|${job.location}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function aggregateJobSearch({
  query,
  providers,
  verifiedSkills,
  timeoutMs = 8_000,
}: {
  query: JobSearchQuery;
  providers: JobSearchProvider[];
  verifiedSkills: string[];
  timeoutMs?: number;
}) {
  const enabled = providers.filter((provider) => provider.enabled);
  const settled = await Promise.allSettled(enabled.map((provider) => provider.search(query, AbortSignal.timeout(timeoutMs))));
  const statuses: JobSearchProviderStatus[] = providers.filter((provider) => !provider.enabled).map((provider) => ({
    id: provider.id, label: provider.label, status: "unavailable", resultCount: 0,
    ...(provider.unavailableMessage ? { message: provider.unavailableMessage } : {}),
  }));
  const results: JobSearchResult[] = [];

  enabled.forEach((provider, index) => {
    const outcome = settled[index];
    if (outcome?.status === "fulfilled") {
      results.push(...outcome.value);
      statuses.push({ id: provider.id, label: provider.label, status: "ok", resultCount: outcome.value.length });
    } else {
      statuses.push({ id: provider.id, label: provider.label, status: "error", resultCount: 0, message: "This source did not respond. Results from other sources are still available." });
    }
  });

  const unique = new Map<string, JobSearchResult>();
  for (const result of results) {
    const scored = scoreResult(result, query, verifiedSkills);
    const key = dedupeKey(scored);
    const existing = unique.get(key);
    if (!existing || scored.matchScore > existing.matchScore) unique.set(key, scored);
  }

  return {
    results: [...unique.values()].sort((a, b) => b.matchScore - a.matchScore || (b.postedAt ?? "").localeCompare(a.postedAt ?? "")),
    providers: statuses.sort((a, b) => a.label.localeCompare(b.label)),
  };
}
