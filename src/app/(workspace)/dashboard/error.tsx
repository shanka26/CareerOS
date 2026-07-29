"use client";

import { Button } from "@/shared/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-5 py-20 text-center"><p className="text-sm font-bold uppercase text-[var(--accent)]">Workspace error</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl">That view could not load.</h1><p className="mt-4 text-[var(--muted)]">Your saved career data was not changed. Try the request again.</p><Button className="mt-7" onClick={reset}>Try again</Button></main>;
}
