import Link from "next/link";

import { JobImportForm } from "@/domains/jobs/job-import-form";
import { JobSearch } from "@/domains/jobs/job-search";
import { JobsTabs, type JobsTab } from "@/domains/jobs/jobs-tabs";
import { buildJobSearchSuggestions } from "@/domains/jobs/search/suggestions";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

interface JobsPageProps {
  searchParams: Promise<{ tab?: string | string[] }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const session = await requireSession();
  const params = await searchParams;
  const activeTab: JobsTab = params.tab === "find-job" ? "find-job" : "my-jobs";

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-5xl">Jobs</h1>
      <p className="mt-3 max-w-3xl text-[var(--muted)]">
        Keep your private job workspaces separate from live job discovery.
      </p>
      <JobsTabs activeTab={activeTab} />
      {activeTab === "find-job"
        ? <FindJobPanel userId={session.user.id} />
        : <MyJobsPanel userId={session.user.id} />}
    </main>
  );
}

async function FindJobPanel({ userId }: { userId: string }) {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
    include: {
      careerSkills: { where: { verified: true }, include: { skill: true } },
      experiences: { where: { verified: true }, orderBy: { startDate: "desc" }, take: 5 },
    },
  });
  const suggestions = buildJobSearchSuggestions({
    targetRole: profile?.targetRole,
    headline: profile?.headline,
    skills: profile?.careerSkills.map(({ skill }) => skill.name) ?? [],
    experienceTitles: profile?.experiences.map(({ title }) => title) ?? [],
  });

  return (
    <section id="find-job-panel" aria-labelledby="find-job-tab" className="pt-8">
      <Card className="p-6 sm:p-8">
        <JobSearch initialSuggestions={suggestions} />
      </Card>
    </section>
  );
}

async function MyJobsPanel({ userId }: { userId: string }) {
  const jobs = await prisma.jobPosting.findMany({
    where: { ownerId: userId },
    orderBy: { importedAt: "desc" },
  });

  return (
    <section id="my-jobs-panel" aria-labelledby="my-jobs-tab" className="pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Jobs</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Review jobs you have saved or imported, continue tailoring application materials, and open the exact workspace connected to each opportunity.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
        <Card className="p-6">
          <details>
            <summary className="cursor-pointer text-xl font-bold">Add a job manually</summary>
            <div className="mt-5"><JobImportForm /></div>
          </details>
        </Card>
        <section aria-labelledby="saved-jobs-heading">
          <h3 id="saved-jobs-heading" className="mb-4 text-xl font-bold">Saved job workspaces</h3>
          <div className="grid content-start gap-3">
            {jobs.length ? jobs.map((job) => (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                <Card className="p-5">
                  <div className="flex justify-between gap-4">
                    <div><h4 className="font-bold">{job.title}</h4><p className="text-sm text-[var(--muted)]">{job.companyName}</p></div>
                    <strong>{job.matchScore ?? 0}%</strong>
                  </div>
                </Card>
              </Link>
            )) : (
              <Card className="p-6 text-sm text-[var(--muted)]">
                No personal job workspaces yet. Use Find Job to discover a listing, or add one manually.
              </Card>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
