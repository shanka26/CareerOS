import { notFound } from "next/navigation";
import { GenerateButtons } from "@/domains/jobs/generate-buttons";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const job = await prisma.jobPosting.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!job) notFound();
  const analysis = job.analysis as {
    matchedSkills?: string[];
    explanation?: string;
  } | null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <p className="text-sm font-bold text-[var(--accent)]">{job.companyName}</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">
        {job.title}
      </h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <GenerateButtons jobId={job.id} />
        <GenerateButtons jobId={job.id} cover />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-[18rem_1fr]">
        <Card className="p-6">
          <p className="text-xs font-bold uppercase text-[var(--muted)]">
            Verified-fact match
          </p>
          <p className="mt-2 text-5xl font-bold">{job.matchScore ?? 0}%</p>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {analysis?.explanation}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis?.matchedSkills?.map((skill) => (
              <span
                className="rounded-full bg-[var(--lime)]/60 px-2 py-1 text-xs font-bold"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-bold">Imported description</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
            {job.description}
          </p>
        </Card>
      </div>
    </main>
  );
}
