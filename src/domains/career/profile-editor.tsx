"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

interface ProfileValues {
  headline: string;
  summary: string;
  targetRole: string;
  preferredLocations: string[];
  remotePreference: string | null;
  careerGoals: string[];
}

export function ProfileEditor({ profile }: { profile: ProfileValues }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const router = useRouter();
  return (
    <form className="grid gap-5" onSubmit={async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      setPending(true);
      setMessage(undefined);
      const response = await fetch("/api/career/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ headline: data.get("headline"), summary: data.get("summary"), targetRole: data.get("targetRole"), preferredLocations: String(data.get("preferredLocations") ?? "").split(",").map((v) => v.trim()).filter(Boolean), remotePreference: data.get("remotePreference") || null, careerGoals: String(data.get("careerGoals") ?? "").split("\n").map((v) => v.trim()).filter(Boolean) }) });
      const result = (await response.json()) as { error?: string };
      setPending(false);
      setMessage(response.ok ? "Profile saved." : result.error ?? "Profile could not be saved.");
      if (response.ok) router.refresh();
    }}>
      <Input label="Headline" name="headline" defaultValue={profile.headline} /><Input label="Target role" name="targetRole" defaultValue={profile.targetRole} />
      <label className="grid gap-2 text-sm font-semibold">Summary<textarea name="summary" defaultValue={profile.summary} rows={5} className="rounded-xl border border-[var(--line)] bg-white p-4 font-normal" /></label>
      <Input label="Preferred locations" name="preferredLocations" defaultValue={profile.preferredLocations.join(", ")} />
      <label className="grid gap-2 text-sm font-semibold">Work preference<select name="remotePreference" defaultValue={profile.remotePreference ?? ""} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"><option value="">Not set</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-site</option><option value="FLEXIBLE">Flexible</option></select></label>
      <label className="grid gap-2 text-sm font-semibold">Career goals<textarea name="careerGoals" defaultValue={profile.careerGoals.join("\n")} rows={3} className="rounded-xl border border-[var(--line)] bg-white p-4 font-normal" /></label>
      {message ? <p role="status" className="text-sm font-semibold text-[var(--muted)]">{message}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}Save profile</Button>
    </form>
  );
}

function Input({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} defaultValue={defaultValue} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal" /></label>;
}
