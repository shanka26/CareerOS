import { ApplicationWorkspace } from "@/domains/applications/application-workspace";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export default async function ApplicationsPage() {
  const session = await requireSession();
  const [jobs, documents, applications] = await Promise.all([
    prisma.jobPosting.findMany({ where: { ownerId: session.user.id, status: { not: "ARCHIVED" } }, orderBy: { importedAt: "desc" } }),
    prisma.document.findMany({
      where: { ownerId: session.user.id, type: { in: ["GENERATED_RESUME", "GENERATED_COVER_LETTER"] } },
      include: { versions: { orderBy: { version: "desc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.application.findMany({
      where: { userId: session.user.id },
      include: { job: true, resumeVersion: true, coverLetterVersion: true },
      orderBy: { lastUpdated: "desc" },
    }),
  ]);
  const choices = documents.flatMap((document) => document.versions.map((version) => ({
    id: version.id,
    label: `${document.title} - v${version.version}`,
    documentId: document.id,
    versionId: version.id,
    type: document.type,
  })));

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">Application CRM</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">Your search, in motion.</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Track every opportunity while preserving the exact resume and cover letter sent.</p>
      <ApplicationWorkspace
        jobs={jobs.map((job) => ({ id: job.id, label: `${job.companyName} - ${job.title}` }))}
        resumes={choices.filter((choice) => choice.type === "GENERATED_RESUME")}
        coverLetters={choices.filter((choice) => choice.type === "GENERATED_COVER_LETTER")}
        applications={applications.map((application) => ({
          id: application.id,
          status: application.status,
          company: application.job.companyName,
          title: application.job.title,
          resume: application.resumeVersion ? { documentId: application.resumeVersion.documentId, version: application.resumeVersion.version } : null,
          coverLetter: application.coverLetterVersion ? { documentId: application.coverLetterVersion.documentId, version: application.coverLetterVersion.version } : null,
        }))}
      />
    </main>
  );
}
