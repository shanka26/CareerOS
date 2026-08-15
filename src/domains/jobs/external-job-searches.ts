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
    { id: "monster", label: "Monster", url: withParams("https://www.monster.com/jobs/search", { q: keywords, where: normalizedLocation }) },
    { id: "careerbuilder", label: "CareerBuilder", url: withParams("https://www.careerbuilder.com/jobs", { keywords, location: normalizedLocation }) },
    { id: "simplyhired", label: "SimplyHired", url: withParams("https://www.simplyhired.com/search", { q: keywords, l: normalizedLocation }) },
    { id: "builtin", label: "Built In", url: withParams("https://builtin.com/jobs", { search: keywords, location: normalizedLocation }) },
    { id: "flexjobs", label: "FlexJobs", url: withParams("https://www.flexjobs.com/search", { search: keywords, location: normalizedLocation }) },
    { id: "snagajob", label: "Snagajob", url: withParams("https://www.snagajob.com/search", { q: keywords, w: normalizedLocation }) },
    { id: "idealist", label: "Idealist", url: withParams("https://www.idealist.org/en/jobs", { q: keywords, location: normalizedLocation }) },
    { id: "wellfound", label: "Wellfound", url: withParams("https://wellfound.com/jobs", { query: keywords, location: normalizedLocation }) },
  ];
}
