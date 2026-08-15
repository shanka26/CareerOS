export interface ExternalJobSearch {
  id: string;
  label: string;
  url: string;
}

function withParams(base: string, params: Record<string, string>) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildExternalJobSearches({
  query,
  location,
  remote,
}: {
  query: string;
  location: string;
  remote: "any" | "remote" | "onsite";
}): ExternalJobSearch[] {
  const normalizedQuery = query.trim();
  const normalizedLocation = location.trim();
  const keywords = remote === "remote" ? `${normalizedQuery} remote`.trim() : normalizedQuery;
  const googleQuery = [keywords, normalizedLocation, "jobs"].filter(Boolean).join(" ");

  return [
    { id: "linkedin", label: "LinkedIn", url: withParams("https://www.linkedin.com/jobs/search/", { keywords, location: normalizedLocation }) },
    { id: "indeed", label: "Indeed", url: withParams("https://www.indeed.com/jobs", { q: keywords, l: normalizedLocation }) },
    { id: "glassdoor", label: "Glassdoor", url: withParams("https://www.glassdoor.com/Job/jobs.htm", { "sc.keyword": keywords, locKeyword: normalizedLocation }) },
    { id: "google", label: "Google Jobs", url: withParams("https://www.google.com/search", { q: googleQuery }) },
    { id: "ziprecruiter", label: "ZipRecruiter", url: withParams("https://www.ziprecruiter.com/jobs-search", { search: keywords, location: normalizedLocation }) },
    { id: "dice", label: "Dice", url: withParams("https://www.dice.com/jobs", { q: keywords, location: normalizedLocation }) },
  ];
}
