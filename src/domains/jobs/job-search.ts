import "server-only";
import { z } from "zod";

const REMOTIVE_ENDPOINT = "https://remotive.com/api/remote-jobs";

const remotiveJobSchema = z.object({
  id: z.number(),
  url: z.url(),
  title: z.string(),
  company_name: z.string(),
  category: z.string().nullish(),
  job_type: z.string().nullish(),
  publication_date: z.string().nullish(),
  candidate_required_location: z.string().nullish(),
  salary: z.string().nullish(),
  description: z.string(),
});

const remotiveResponseSchema = z.object({ jobs: z.array(remotiveJobSchema) });

export type JobSearchResult = {
  source: "Remotive";
  sourceId: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  employmentType: string | null;
  category: string | null;
  salary: string | null;
  publishedAt: string | null;
  description: string;
};

export function htmlToPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<li[^>]*>/gi, "\n")
    .replace(/<\/li>/gi, "")
    .replace(/<\/?(?:p|div|ul|ol|h[1-6]|br|section|article|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function includes(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export async function searchRemoteJobs(filters: { query?: string; company?: string; location?: string }) {
  const response = await fetch(REMOTIVE_ENDPOINT, {
    headers: { "user-agent": "CareerOS Job Discovery/1.0" },
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Job search provider returned HTTP ${response.status}.`);

  const parsed = remotiveResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Job search provider returned an unexpected response.");

  const query = filters.query?.trim() ?? "";
  const company = filters.company?.trim() ?? "";
  const location = filters.location?.trim() ?? "";

  return parsed.data.jobs
    .filter((job) => !query || includes(`${job.title} ${job.category ?? ""} ${htmlToPlainText(job.description)}`, query))
    .filter((job) => !company || includes(job.company_name, company))
    .filter((job) => !location || includes(job.candidate_required_location ?? "Worldwide", location))
    .slice(0, 30)
    .map<JobSearchResult>((job) => ({
      source: "Remotive",
      sourceId: String(job.id),
      sourceUrl: job.url,
      title: job.title.trim(),
      company: job.company_name.trim(),
      location: job.candidate_required_location?.trim() || "Worldwide",
      employmentType: job.job_type?.replaceAll("_", " ") ?? null,
      category: job.category?.trim() || null,
      salary: job.salary?.trim() || null,
      publishedAt: job.publication_date ?? null,
      description: htmlToPlainText(job.description).slice(0, 100_000),
    }));
}
