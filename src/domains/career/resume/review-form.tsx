"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

import type { ResumeDraft } from "./draft";

export function ResumeReviewForm({ suggestionId, draft }: { suggestionId: string; draft: ResumeDraft }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError(undefined);
        const response = await fetch("/api/career/resume/approve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            suggestionId,
            headline: data.get("headline"),
            summary: data.get("summary"),
            targetRole: data.get("targetRole"),
            preferredLocations: String(data.get("preferredLocations") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
            remotePreference: data.get("remotePreference") || null,
            careerGoals: String(data.get("careerGoals") ?? "").split("\n").map((value) => value.trim()).filter(Boolean),
            salaryExpectation: data.get("salaryExpectation"),
            skills: String(data.get("skills") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
          }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(result.error ?? "The profile could not be saved.");
          setPending(false);
          return;
        }
        router.refresh();
      }}
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Review required.</strong> The parser only suggests conservative fields. Correct or remove anything that is not true before approval.</div>
      <TextField label="Professional headline" name="headline" defaultValue={draft.headline ?? ""} />
      <TextField label="Target role" name="targetRole" />
      <TextArea label="Career summary" name="summary" rows={4} />
      <TextField label="Skills (comma-separated)" name="skills" defaultValue={draft.skills.join(", ")} />
      <TextField label="Preferred locations (comma-separated)" name="preferredLocations" />
      <label className="grid gap-2 text-sm font-semibold">Work preference<select name="remotePreference" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"><option value="">Not set</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-site</option><option value="FLEXIBLE">Flexible</option></select></label>
      <TextArea label="Career goals (one per line)" name="careerGoals" rows={3} />
      <TextField label="Salary expectations (optional)" name="salaryExpectation" />
      <details className="rounded-2xl border border-[var(--line)] bg-white/50 p-4"><summary className="cursor-pointer font-bold">Compare against extracted text</summary><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[var(--muted)]">{draft.rawText}</pre></details>
      <div className="rounded-2xl bg-[var(--ink)] p-5 text-[var(--paper)]"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/50">Questions to strengthen your profile</p><ul className="mt-3 grid gap-2 text-sm">{draft.questions.map((question) => <li key={question}>• {question}</li>)}</ul></div>
      {error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}Approve these facts</Button>
    </form>
  );
}

function TextField({ label, name, defaultValue = "" }: { label: string; name: string; defaultValue?: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} defaultValue={defaultValue} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal outline-none focus:border-[var(--focus)]" /></label>;
}

function TextArea({ label, name, rows }: { label: string; name: string; rows: number }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<textarea name={name} rows={rows} className="rounded-xl border border-[var(--line)] bg-white p-4 font-normal outline-none focus:border-[var(--focus)]" /></label>;
}
