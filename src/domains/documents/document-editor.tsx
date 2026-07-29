"use client";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";

export function DocumentEditor({ id, markdown }: { id: string; markdown: string }) {
  const [pending, setPending] = useState(false); const [message, setMessage] = useState<string>(); const router = useRouter();
  return <form className="grid gap-4" onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setPending(true); const response = await fetch(`/api/documents/${id}/versions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: data.get("markdown"), explanation: data.get("explanation") }) }); const result = (await response.json()) as { error?: string }; setMessage(response.ok ? "Saved as a new immutable version." : result.error); setPending(false); if (response.ok) router.refresh(); }}><textarea name="markdown" defaultValue={markdown} rows={22} className="rounded-2xl border border-[var(--line)] bg-white p-5 font-mono text-sm leading-6" /><input name="explanation" placeholder="What did you change?" className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-4" />{message ? <p className="text-sm font-semibold text-[var(--muted)]">{message}</p> : null}<Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}Save new version</Button></form>;
}
