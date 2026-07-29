"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";

export function SuggestionReview({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  return <div className="mt-4 flex flex-wrap items-center gap-3"><Link className="text-sm font-bold underline" href="/dashboard/career">Review and approve in Career Profile</Link><Button variant="secondary" size="small" disabled={pending} onClick={async () => {
    setPending(true);
    const response = await fetch(`/api/memory-suggestions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "REJECT" }) });
    const result = (await response.json()) as { error?: string };
    if (response.ok) router.refresh();
    else { setError(result.error ?? "Review failed."); setPending(false); }
  }}>{pending ? "Rejecting..." : "Reject"}</Button>{error ? <p className="w-full text-sm text-red-700" role="alert">{error}</p> : null}</div>;
}
