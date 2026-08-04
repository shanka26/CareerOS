import { ArrowUpRight, FileUp, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/domains/settings/auth/session";
import { Card } from "@/shared/ui/card";

export default async function DashboardPage() {
  const session = await requireSession();
  const firstName = session.user.name.split(" ")[0];
  return <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">Your Career Twin</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl tracking-[-.045em] sm:text-6xl">Good to meet you, {firstName}.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">Turn the resume you already have into career knowledge you can verify, improve, and reuse.</p><div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><Card className="p-6 sm:p-8"><div className="grid size-12 place-items-center rounded-2xl bg-[var(--lime)]"><FileUp className="size-5" /></div><h2 className="mt-8 font-[family-name:var(--font-display)] text-3xl">Upload-first onboarding</h2><p className="mt-3 max-w-lg leading-7 text-[var(--muted)]">Turn an existing PDF or Word resume—including scans—into a pending draft, then verify every fact before it joins your Career Profile.</p><Link href="/dashboard/career" className="mt-8 inline-flex items-center gap-2 text-sm font-bold">Build your career profile <ArrowUpRight className="size-4" /></Link></Card><Card className="p-6 sm:p-8"><ShieldCheck className="size-7 text-[var(--focus)]" /><h2 className="mt-5 text-xl font-bold">Your control is structural</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">AI-proposed facts remain pending until you approve them. Generated documents never replace your verified profile.</p><Link href="/dashboard/assistant" className="mt-6 inline-block text-sm font-bold underline">Review assistant guidance</Link></Card></div></main>;
}
