import { NextResponse } from "next/server";
import { z } from "zod";
import { searchRemoteJobs } from "@/domains/jobs/job-search";
import { getSession } from "@/domains/settings/auth/session";

const searchSchema = z.object({
  q: z.string().trim().max(100).default(""),
  company: z.string().trim().max(100).default(""),
  location: z.string().trim().max(100).default(""),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    company: url.searchParams.get("company") ?? "",
    location: url.searchParams.get("location") ?? "",
  });
  if (!parsed.success) return NextResponse.json({ error: "Search filters must be 100 characters or fewer." }, { status: 400 });

  try {
    const jobs = await searchRemoteJobs({ query: parsed.data.q, company: parsed.data.company, location: parsed.data.location });
    return NextResponse.json({ jobs, attribution: "Jobs provided by Remotive" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Job search is temporarily unavailable." }, { status: 502 });
  }
}
