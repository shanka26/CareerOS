import Link from "next/link";
import { SuggestionReview } from "@/domains/assistant/suggestion-review";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function AssistantPage() {
  const session = await requireSession();
  const [profile, suggestions] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId: session.user.id }, include: { _count: { select: { experiences: true, careerSkills: true } } } }),
    prisma.memorySuggestion.findMany({ where: { userId: session.user.id, status: "PENDING" }, orderBy: { createdAt: "desc" } }),
  ]);
  const questions = [
    !profile?.targetRole ? "What role do you want to target next?" : null,
    !profile?.summary ? "How would you describe the work you want to be known for?" : null,
    !profile?._count.experiences ? "Which recent role best demonstrates your impact?" : null,
    !profile?._count.careerSkills ? "Which skills can you support with real work evidence?" : null,
  ].filter((question): question is string => Boolean(question));

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><p className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">Career Twin assistant</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">Build knowledge, not guesses.</h1><p className="mt-3 max-w-2xl text-[var(--muted)]">These prompts are deterministic onboarding guidance. Any factual proposal stays pending until you review it.</p><div className="mt-8 grid gap-5 lg:grid-cols-2"><Card className="p-6"><h2 className="text-lg font-bold">Targeted questions</h2>{questions.length ? <ul className="mt-4 space-y-3">{questions.map((question) => <li className="rounded-xl bg-[var(--paper)] p-4 text-sm" key={question}>{question}</li>)}</ul> : <p className="mt-4 text-sm text-[var(--muted)]">Your core profile fields are in place. Add evidence as your career evolves.</p>}<Link className="mt-5 inline-block text-sm font-bold underline" href="/dashboard/career">Update Career Profile</Link></Card><Card className="p-6"><h2 className="text-lg font-bold">Pending factual suggestions</h2>{suggestions.length ? <div className="mt-4 space-y-4">{suggestions.map((suggestion) => <article className="rounded-xl border border-[var(--line)] p-4" key={suggestion.id}><p className="text-xs font-bold uppercase text-[var(--muted)]">{suggestion.source}</p><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(suggestion.proposedFact, null, 2)}</pre><SuggestionReview id={suggestion.id} /></article>)}</div> : <p className="mt-4 text-sm text-[var(--muted)]">Nothing is waiting for approval.</p>}</Card></div></main>;
}
