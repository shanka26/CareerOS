import { notFound } from "next/navigation";
import Link from "next/link";
import { applicationStatusLabel } from "@/domains/applications/status";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const application = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: {
      job: true,
      resumeVersion: true,
      coverLetterVersion: true,
      timelineEvents: { orderBy: { occurredAt: "desc" } },
    },
  });
  if (!application) notFound();

  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8"><p className="text-sm font-bold text-[var(--accent)]">{application.job.companyName}</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">{application.job.title}</h1><p className="mt-3 text-[var(--muted)]">{applicationStatusLabel(application.status)}{application.appliedDate ? ` since ${application.appliedDate.toLocaleDateString()}` : ""}</p><div className="mt-8 grid gap-5 md:grid-cols-2"><Card className="p-6"><h2 className="text-lg font-bold">Exact application artifacts</h2><div className="mt-4 grid gap-3">{application.resumeVersion ? <Link className="rounded-xl border border-[var(--line)] p-4 font-bold hover:bg-[var(--paper)]" href={`/dashboard/documents/${application.resumeVersion.documentId}?version=${application.resumeVersion.version}`}>Resume version {application.resumeVersion.version}</Link> : <p className="text-sm text-[var(--muted)]">No resume linked.</p>}{application.coverLetterVersion ? <Link className="rounded-xl border border-[var(--line)] p-4 font-bold hover:bg-[var(--paper)]" href={`/dashboard/documents/${application.coverLetterVersion.documentId}?version=${application.coverLetterVersion.version}`}>Cover letter version {application.coverLetterVersion.version}</Link> : <p className="text-sm text-[var(--muted)]">No cover letter linked.</p>}</div></Card><Card className="p-6"><h2 className="text-lg font-bold">Timeline</h2>{application.timelineEvents.length ? <ol className="mt-4 border-l border-[var(--line)] pl-5">{application.timelineEvents.map((event) => <li className="relative pb-5 last:pb-0" key={event.id}><span className="absolute -left-[1.57rem] top-1 size-2 rounded-full bg-[var(--accent)]" /><p className="font-bold">{event.title}</p><time className="text-xs text-[var(--muted)]">{event.occurredAt.toLocaleString()}</time>{event.notes ? <p className="mt-1 text-sm text-[var(--muted)]">{event.notes}</p> : null}</li>)}</ol> : <p className="mt-4 text-sm text-[var(--muted)]">No history recorded yet.</p>}</Card></div></main>;
}
