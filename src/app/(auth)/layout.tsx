import { Layers3, LockKeyhole } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/shared/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[var(--ink)] p-12 text-[var(--paper)] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 top-1/4 size-[30rem] rounded-full bg-[var(--accent)]/20 blur-3xl" aria-hidden="true" />
        <Link href="/" className="relative flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[var(--paper)] text-[var(--ink)]"><Layers3 className="size-4" /></span>CareerOS</Link>
        <div className="relative max-w-xl"><p className="font-[family-name:var(--font-display)] text-6xl leading-[1.02] tracking-[-.05em]">The facts stay yours. The leverage grows.</p><p className="mt-6 max-w-md text-base leading-7 text-white/60">Your verified experience is the source of truth. Every document is an explainable output you control.</p></div>
        <p className="relative flex items-center gap-2 text-xs font-semibold text-white/50"><LockKeyhole className="size-4" />Private by default · approval before factual changes</p>
      </section>
      <section className="grid place-items-center px-5 py-10 sm:px-8"><div className="w-full max-w-md"><Link href="/" className="mb-8 flex items-center gap-2 font-bold lg:hidden"><Layers3 className="size-5" />CareerOS</Link><Card className="p-6 sm:p-8">{children}</Card></div></section>
    </main>
  );
}
