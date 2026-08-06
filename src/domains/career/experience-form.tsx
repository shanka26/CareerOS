"use client";

import { LoaderCircle, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { messageFromError, requestJson } from "@/shared/lib/api-client";

interface ExperienceValues { id: string; company: string; title: string; startDate: string; endDate: string; current: boolean; description: string }

export function ExperienceForm({ experience }: { experience?: ExperienceValues }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();
  if (!open) return <Button type="button" variant="secondary" size={experience ? "small" : "default"} onClick={() => setOpen(true)}>{experience ? <Pencil className="mr-1 size-3" /> : <Plus className="mr-2 size-4" />}{experience ? "Edit" : "Add experience"}</Button>;

  return <form className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white/60 p-5" onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError(undefined);
    try {
      await requestJson("/api/career/experiences", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: experience?.id, company: data.get("company"), title: data.get("title"), startDate: data.get("startDate"), endDate: data.get("endDate"), current: data.get("current") === "on", description: data.get("description") }) }, "Experience could not be saved.");
      setOpen(false);
      router.refresh();
    } catch (requestError) {
      setError(messageFromError(requestError, "Experience could not be saved."));
    } finally {
      setPending(false);
    }
  }}>
    <div className="grid gap-4 sm:grid-cols-2"><Input name="company" label="Company" defaultValue={experience?.company} /><Input name="title" label="Title" defaultValue={experience?.title} /><Input name="startDate" label="Start date" type="date" defaultValue={experience?.startDate} /><Input name="endDate" label="End date" type="date" defaultValue={experience?.endDate} /></div>
    <label className="flex items-center gap-2 text-sm font-semibold"><input name="current" type="checkbox" defaultChecked={experience?.current} />I currently work here</label>
    <label className="grid gap-2 text-sm font-semibold">What did you do?<textarea name="description" required rows={4} defaultValue={experience?.description} className="rounded-xl border border-[var(--line)] bg-white p-3 font-normal" /></label>
    {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    <div className="flex gap-3"><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Save verified experience</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
  </form>;
}

function Input({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue?: string | undefined }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} type={type} defaultValue={defaultValue} required={type === "text"} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3 font-normal" /></label>;
}
