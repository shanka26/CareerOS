import { z } from "zod";

export const jobSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  location: z.string().trim().max(100).default(""),
  remote: z.enum(["any", "remote", "onsite"]).default("any"),
});

export type JobSearchQuery = z.infer<typeof jobSearchQuerySchema>;

export interface JobSearchResult {
  id: string;
  source: string;
  sourceLabel: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  url: string;
  postedAt: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  matchedSkills: string[];
  matchScore: number;
}

export interface JobSearchProviderStatus {
  id: string;
  label: string;
  status: "ok" | "unavailable" | "error";
  resultCount: number;
  message?: string;
}

export interface JobSearchProvider {
  id: string;
  label: string;
  enabled: boolean;
  unavailableMessage?: string;
  search(query: JobSearchQuery, signal: AbortSignal): Promise<JobSearchResult[]>;
}

export interface JobSearchSuggestions {
  keywords: string[];
  prompts: string[];
}
