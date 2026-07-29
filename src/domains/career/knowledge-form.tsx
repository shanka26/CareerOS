"use client";

import { LoaderCircle, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";

type KnowledgeKind = "skill" | "achievement" | "project" | "education" | "certification";
type InitialValues = Record<string, string | string[] | undefined> & { id?: string };

const labels: Record<KnowledgeKind, string> = { skill: "skill", achievement: "achievement", project: "project", education: "education", certification: "certification" };

export function KnowledgeForm({ kind, initial }: { kind: KnowledgeKind; initial?: InitialValues }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();
  if (!open) return <Button type="button" variant="secondary" size="small" onClick={() => setOpen(true)}>{initial ? <Pencil className="mr-1 size-3" /> : <Plus className="mr-1 size-3" />}{initial ? "Edit" : `Add ${labels[kind]}`}</Button>;

  return <form className="mt-3 grid gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-4" onSubmit={async (event) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/career/knowledge", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, kind, id: initial?.id, quantified: kind === "achievement" ? values.quantified === "on" : undefined, technologies: kind === "project" ? String(values.technologies ?? "").split(",").map((value) => value.trim()).filter(Boolean) : undefined }) });
    const result = (await response.json()) as { error?: string };
    if (response.ok) { setOpen(false); router.refresh(); }
    else setError(result.error ?? "Career knowledge could not be saved.");
    setPending(false);
  }}>
    {kind === "skill" ? <><Field name="name" label="Skill" value={initial?.name} required /><Field name="category" label="Category" value={initial?.category ?? "User"} required /><Field name="proficiency" label="Proficiency" value={initial?.proficiency} /></> : null}
    {kind === "achievement" ? <><input type="hidden" name="experienceId" value={typeof initial?.experienceId === "string" ? initial.experienceId : ""} /><Area name="description" label="Achievement" value={initial?.description} required /><Field name="metric" label="Metric or outcome" value={initial?.metric} /><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="quantified" defaultChecked={initial?.quantified === "true"} />Includes a verified quantity</label></> : null}
    {kind === "project" ? <><Field name="name" label="Project name" value={initial?.name} required /><Area name="description" label="Description" value={initial?.description} required /><Area name="impact" label="Impact" value={initial?.impact} /><Field name="technologies" label="Technologies (comma-separated)" value={Array.isArray(initial?.technologies) ? initial.technologies.join(", ") : initial?.technologies} /></> : null}
    {kind === "education" ? <><Field name="school" label="School" value={initial?.school} required /><Field name="degree" label="Degree" value={initial?.degree} /><Field name="field" label="Field" value={initial?.field} /><Field name="graduationDate" label="Graduation date" value={initial?.graduationDate} type="date" /></> : null}
    {kind === "certification" ? <><Field name="name" label="Certification" value={initial?.name} required /><Field name="issuer" label="Issuer" value={initial?.issuer} required /><Field name="issueDate" label="Issue date" value={initial?.issueDate} type="date" /><Field name="expirationDate" label="Expiration date" value={initial?.expirationDate} type="date" /></> : null}
    {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}
    <div className="flex gap-2"><Button size="small" disabled={pending}>{pending ? <LoaderCircle className="mr-1 size-3 animate-spin" /> : null}Save verified fact</Button><Button type="button" variant="ghost" size="small" onClick={() => setOpen(false)}>Cancel</Button></div>
  </form>;
}

function Field({ name, label, value, type = "text", required = false }: { name: string; label: string; value?: string | string[] | undefined; type?: string; required?: boolean }) {
  return <label className="grid gap-1 text-xs font-bold">{label}<input className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 font-normal" name={name} type={type} defaultValue={typeof value === "string" ? value : ""} required={required} /></label>;
}

function Area({ name, label, value, required = false }: { name: string; label: string; value?: string | string[] | undefined; required?: boolean }) {
  return <label className="grid gap-1 text-xs font-bold">{label}<textarea className="rounded-lg border border-[var(--line)] bg-white p-3 font-normal" name={name} defaultValue={typeof value === "string" ? value : ""} rows={3} required={required} /></label>;
}
