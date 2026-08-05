import Link from "next/link";

import { JobImportForm } from "@/domains/jobs/job-import-form";
import { JobSearch } from "@/domains/jobs/job-search";
import { buildJobSearchSuggestions } from "@/domains/jobs/search/suggestions";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function JobsPage() {
  const session = await requireSession();
  const [jobs, profile] = await Promise.all([
    prisma.jobPosting.findMany({
      where: { ownerId: session.user.id },
      orderBy: { importedAt: "desc" },
    }),
    prisma.careerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        careerSkills: { where: { verified: true }, include: { skill: true } },
        experiences: { where: { verified: true }, orderBy: { startDate: "desc" }, take: 5 },
      },
    }),
  ]);
  const suggestions = buildJobSearchSuggestions({
    targetRole: profile?.targetRole,
    headline: profile?.headline,
    skills: profile?.careerSkills.map(({ skill }) => skill.name) ?? [],
    experienceTitles: profile?.experiences.map(({ title }) => title) ?? [],
  });

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">Find and track jobs</h1>
      <p className="mt-3 max-w-3xl text-[var(--muted)]">
        Search across configured sources, compare profile matches, then bring promising listings into a private CareerOS workspace.
      </p>
      <Card className="mt-8 p-6 sm:p-8"><JobSearch initialSuggestions={suggestions} /></Card>
      <div className="mt-8 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <Card className="p-6">
          <details><summary className="cursor-pointer text-xl font-bold">Import a listing manually</summary><div className="mt-5"><JobImportForm /></div></details>
        </Card>
        <section aria-labelledby="saved-jobs-heading">
          <h2 id="saved-jobs-heading" className="mb-4 text-2xl font-bold">Saved job workspaces</h2>
          <div className="grid content-start gap-3">
            {jobs.length ? jobs.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                <Card className="p-5"><div className="flex justify-between gap-4"><div><h3 className="font-bold">{job.title}</h3><p className="text-sm text-[var(--muted)]">{job.companyName}</p></div><strong>{job.matchScore ?? 0}%</strong></div></Card>
              </Link>
            )) : <Card className="p-6 text-sm text-[var(--muted)]">Jobs you choose to analyze will appear here.</Card>}
          </div>
        </section>
      </div>
    </main>
  );
}
