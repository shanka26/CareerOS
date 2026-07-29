import { ArrowRight, Check, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";

import { Card } from "@/shared/ui/card";

const steps = ["Upload your resume", "Verify your career story", "Tailor every application"];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden px-5 pb-16 pt-6 sm:px-8 lg:px-12">
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between" aria-label="Primary">
        <a href="#top" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--ink)] text-[var(--paper)]">
            <Layers3 className="size-4" aria-hidden="true" />
          </span>
          CareerOS
        </a>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="rounded-full px-3 py-2 text-sm font-bold text-[var(--muted)] hover:bg-white/70">Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-bold text-[var(--paper)]">Create account</Link>
        </div>
      </nav>

      <section id="top" className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 pb-12 pt-20 lg:grid-cols-[1.08fr_.92fr] lg:pt-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-3 py-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">
            <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
            Career knowledge that compounds
          </div>
          <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-6xl leading-[.95] tracking-[-.055em] text-[var(--ink)] sm:text-7xl lg:text-[5.8rem]">
            Your career is bigger than your resume.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            CareerOS turns verified experience into a living career profile—then helps you create honest, explainable applications for every opportunity.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/sign-up" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--ink)] px-6 font-semibold text-[var(--paper)] shadow-[0_12px_32px_rgba(20,28,24,.2)]">
              Start with your resume <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <span className="text-sm font-medium text-[var(--muted)]">AI suggests. You decide.</span>
          </div>
        </div>

        <Card className="relative mx-auto w-full max-w-xl p-4 sm:p-6">
          <div className="rounded-[1.15rem] bg-[var(--ink)] p-6 text-[var(--paper)] sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-white/55">Career profile</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Source of truth</span>
            </div>
            <p className="mt-8 font-[family-name:var(--font-display)] text-3xl leading-tight">Build once. Get sharper with every application.</p>
            <div className="mt-8 space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-3.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--lime)] text-sm font-bold text-[var(--ink)]">
                    {index === 0 ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="text-sm font-semibold">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 shadow-lg sm:-left-8">
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--muted)]">Trust rule</p>
            <p className="mt-1 text-sm font-bold">No invented facts. Ever.</p>
          </div>
        </Card>
      </section>
    </main>
  );
}
