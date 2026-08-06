"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applicationStatuses, applicationStatusLabel, type ApplicationStatusValue } from "./status";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { messageFromError, requestJson } from "@/shared/lib/api-client";

type Choice = { id: string; label: string; documentId: string; versionId: string };
type ApplicationCard = {
  id: string;
  status: ApplicationStatusValue;
  company: string;
  title: string;
  resume: { documentId: string; version: number } | null;
  coverLetter: { documentId: string; version: number } | null;
};

export function ApplicationWorkspace({
  jobs,
  resumes,
  coverLetters,
  applications,
}: {
  jobs: { id: string; label: string }[];
  resumes: Choice[];
  coverLetters: Choice[];
  applications: ApplicationCard[];
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? "");
  const [coverId, setCoverId] = useState(coverLetters[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function createApplication() {
    const resume = resumes.find((item) => item.id === resumeId);
    const coverLetter = coverLetters.find((item) => item.id === coverId);
    if (!jobId || !resume || !coverLetter) {
      setError("Import a job and generate both documents before creating an application.");
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      await requestJson("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId,
          resumeDocumentId: resume.documentId,
          resumeVersionId: resume.versionId,
          coverLetterDocumentId: coverLetter.documentId,
          coverLetterVersionId: coverLetter.versionId,
        }),
      }, "Application creation failed.");
      router.refresh();
    } catch (requestError) {
      setError(messageFromError(requestError, "Application creation failed."));
    } finally {
      setPending(false);
    }
  }

  async function moveApplication(id: string, status: ApplicationStatusValue) {
    setError(undefined);
    try {
      await requestJson(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      }, "Status update failed.");
      router.refresh();
    } catch (requestError) {
      setError(messageFromError(requestError, "Status update failed."));
    }
  }

  return (
    <>
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-bold">Create a tracked application</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">The exact selected document versions remain attached even after later edits.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Select label="Job" value={jobId} onChange={setJobId} options={jobs} />
          <Select label="Resume version" value={resumeId} onChange={setResumeId} options={resumes} />
          <Select label="Cover letter version" value={coverId} onChange={setCoverId} options={coverLetters} />
        </div>
        <Button className="mt-5" disabled={pending} onClick={createApplication}>{pending ? "Creating..." : "Create as Ready"}</Button>
        {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
      </Card>

      <div className="mt-8 overflow-x-auto pb-4">
        <div className="grid min-w-[1800px] grid-cols-10 gap-4">
          {applicationStatuses.map((status) => (
            <section key={status} aria-labelledby={`column-${status}`}>
              <h2 id={`column-${status}`} className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{applicationStatusLabel(status)}</h2>
              <div className="space-y-3">
                {applications.filter((application) => application.status === status).map((application) => (
                  <Card className="p-4" key={application.id}>
                    <p className="text-xs font-bold text-[var(--accent)]">{application.company}</p>
                    <h3 className="mt-1 font-bold">{application.title}</h3>
                    <Link className="mt-2 inline-block text-xs font-bold underline" href={`/dashboard/applications/${application.id}`}>View history</Link>
                    <div className="mt-3 space-y-1 text-xs">
                      {application.resume ? <Link className="underline" href={`/dashboard/documents/${application.resume.documentId}`}>Resume v{application.resume.version}</Link> : null}
                      {application.coverLetter ? <><br /><Link className="underline" href={`/dashboard/documents/${application.coverLetter.documentId}`}>Cover letter v{application.coverLetter.version}</Link></> : null}
                    </div>
                    <label className="mt-4 block text-xs font-bold">
                      Move to
                      <select className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white p-2 font-normal" value={application.status} onChange={(event) => moveApplication(application.id, event.target.value as ApplicationStatusValue)}>
                        {applicationStatuses.map((option) => <option key={option} value={option}>{applicationStatusLabel(option)}</option>)}
                      </select>
                    </label>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { id: string; label: string }[] }) {
  return <label className="text-sm font-bold">{label}<select className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white p-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select...</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>;
}
