"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { messageFromError, requestJson } from "@/shared/lib/api-client";
import { Button } from "@/shared/ui/button";

export function JobImportForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError(undefined);

        try {
          const result = await requestJson<{ id?: string }>(
            "/api/jobs",
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                url: String(data.get("url") ?? "").trim() || undefined,
                text: String(data.get("text") ?? "").trim() || undefined,
              }),
            },
            "The job could not be analyzed.",
          );
          if (!result.id) throw new Error("The job analysis returned an incomplete response.");
          router.push(`/dashboard/jobs/${result.id}`);
        } catch (requestError) {
          setError(messageFromError(requestError, "The job could not be analyzed."));
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="grid gap-2 text-sm font-semibold">
        Public job URL
        <input name="url" type="url" placeholder="https://company.com/jobs/role" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal" />
      </label>
      <div className="text-center text-xs font-bold text-[var(--muted)]">OR</div>
      <label className="grid gap-2 text-sm font-semibold">
        Paste job description
        <textarea name="text" rows={12} className="rounded-xl border border-[var(--line)] bg-white p-4 font-normal" />
      </label>
      {error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}
      <Button disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Analyze and save job</Button>
    </form>
  );
}
