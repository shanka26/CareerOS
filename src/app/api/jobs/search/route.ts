import { NextResponse } from "next/server";

import { serverEnv } from "@/config/server-env";
import { aggregateJobSearch } from "@/domains/jobs/search/aggregate";
import { createJobSearchProviders } from "@/domains/jobs/search/providers";
import { buildJobSearchSuggestions } from "@/domains/jobs/search/suggestions";
import { jobSearchQuerySchema } from "@/domains/jobs/search/types";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export const maxDuration = 30;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const parsed = jobSearchQuerySchema.safeParse({
    q: url.searchParams.get("q"),
    location: url.searchParams.get("location") ?? "",
    remote: url.searchParams.get("remote") ?? "any",
  });
  if (!parsed.success) return NextResponse.json({ error: "Enter at least two characters and valid search filters." }, { status: 400 });

  const profile = await prisma.careerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      careerSkills: { where: { verified: true }, include: { skill: true } },
      experiences: { where: { verified: true }, orderBy: { startDate: "desc" }, take: 5 },
    },
  });
  const skills = profile?.careerSkills.map(({ skill }) => skill.name) ?? [];
  const suggestions = buildJobSearchSuggestions({
    targetRole: profile?.targetRole,
    headline: profile?.headline,
    skills,
    experienceTitles: profile?.experiences.map(({ title }) => title) ?? [],
  });
  const providers = createJobSearchProviders({
    adzunaAppId: serverEnv.ADZUNA_APP_ID,
    adzunaAppKey: serverEnv.ADZUNA_APP_KEY,
    adzunaCountry: serverEnv.ADZUNA_COUNTRY.toLowerCase(),
    usaJobsApiKey: serverEnv.USAJOBS_API_KEY,
    usaJobsUserAgent: serverEnv.USAJOBS_USER_AGENT,
    museApiKey: serverEnv.THE_MUSE_API_KEY,
  });
  const search = await aggregateJobSearch({ query: parsed.data, providers, verifiedSkills: skills });

  return NextResponse.json({ ...search, suggestions }, { headers: { "cache-control": "private, no-store" } });
}
