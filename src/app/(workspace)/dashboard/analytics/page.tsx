import { calculateCareerMetrics } from "@/domains/analytics/metrics";
import { calculateProfileCompleteness } from "@/domains/career/completeness";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function AnalyticsPage() {
  const session = await requireSession();
  const [applications, profile, pendingSuggestions] = await Promise.all([
    prisma.application.findMany({ where: { userId: session.user.id }, select: { status: true, appliedDate: true } }),
    prisma.careerProfile.findUnique({ where: { userId: session.user.id }, include: { _count: { select: { experiences: true, careerSkills: true, education: true } } } }),
    prisma.memorySuggestion.count({ where: { userId: session.user.id, status: "PENDING" } }),
  ]);
  const metrics = calculateCareerMetrics(applications.map((application) => ({ status: application.status, applied: Boolean(application.appliedDate) })));
  const completeness = profile ? calculateProfileCompleteness({ headline: profile.headline, summary: profile.summary, targetRole: profile.targetRole, preferredLocations: profile.preferredLocations, experienceCount: profile._count.experiences, skillCount: profile._count.careerSkills, educationCount: profile._count.education }) : 0;
  const cards = [
    ["Tracked", metrics.tracked, "All application records"],
    ["Submitted", metrics.submitted, "Applications marked Applied or beyond"],
    ["Response rate", `${metrics.responseRate}%`, `${metrics.responses} recorded responses`],
    ["Interview rate", `${metrics.interviewRate}%`, `${metrics.interviews} interview outcomes`],
    ["Offer rate", `${metrics.offerRate}%`, `${metrics.offers} current offers`],
    ["Career Twin", `${completeness}%`, `${pendingSuggestions} facts awaiting your review`],
  ] as const;
  return <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><p className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">Career analytics</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">See what is working.</h1><p className="mt-3 max-w-2xl text-[var(--muted)]">Metrics are calculated only from your tracked pipeline. Empty denominators display 0%, never an invented benchmark.</p><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value, detail]) => <Card className="p-6" key={label}><p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</p><p className="mt-3 text-5xl font-bold">{value}</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{detail}</p></Card>)}</div><Card className="mt-8 p-6"><h2 className="text-lg font-bold">Measurement notes</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">A response is a recruiter screen, interview, offer, or rejection. Interview rate counts technical/final interviews and offers. Rates use submitted applications as the denominator; current pipeline state is used for this MVP.</p></Card></main>;
}
