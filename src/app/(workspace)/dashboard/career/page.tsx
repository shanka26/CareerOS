import { CheckCircle2, CircleDashed, Sparkles } from "lucide-react";

import { calculateProfileCompleteness } from "@/domains/career/completeness";
import { ExperienceForm } from "@/domains/career/experience-form";
import { ProfileEditor } from "@/domains/career/profile-editor";
import { resumeDraftSchema } from "@/domains/career/resume/draft";
import { ResumeReviewForm } from "@/domains/career/resume/review-form";
import { ResumeUpload } from "@/domains/career/resume/resume-upload";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function CareerProfilePage() {
  const session = await requireSession();
  const [profile, pendingSuggestion] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId: session.user.id }, include: { experiences: { orderBy: { startDate: "desc" } }, careerSkills: { include: { skill: true }, orderBy: { createdAt: "asc" } }, education: true } }),
    prisma.memorySuggestion.findFirst({ where: { userId: session.user.id, status: "PENDING", source: { startsWith: "resume:" } }, orderBy: { createdAt: "desc" } }),
  ]);
  const parsedDraft = pendingSuggestion ? resumeDraftSchema.safeParse(pendingSuggestion.proposedFact) : null;
  const completeness = profile ? calculateProfileCompleteness({ ...profile, experienceCount: profile.experiences.length, skillCount: profile.careerSkills.length, educationCount: profile.education.length }) : 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">Career Knowledge Graph</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[-.04em]">Your whole career, verified.</h1><p className="mt-3 max-w-2xl text-[var(--muted)]">Documents come from this profile. AI suggestions never change it without your approval.</p></div><div className="rounded-2xl border border-[var(--line)] bg-white/65 px-5 py-4"><span className="text-xs font-bold uppercase tracking-[.15em] text-[var(--muted)]">Completeness</span><span className="ml-4 text-2xl font-bold">{completeness}%</span></div></div>
      {pendingSuggestion && parsedDraft?.success ? <Card className="mt-10 p-6 sm:p-8"><div className="mb-7 flex items-center gap-3"><Sparkles className="size-5 text-[var(--accent)]" /><div><h2 className="text-xl font-bold">Review extracted information</h2><p className="text-sm text-[var(--muted)]">Pending—not part of your verified profile yet.</p></div></div><ResumeReviewForm suggestionId={pendingSuggestion.id} draft={parsedDraft.data} /></Card> : null}
      {!profile && !pendingSuggestion ? <Card className="mt-10 p-6 sm:p-8"><h2 className="font-[family-name:var(--font-display)] text-3xl">Start with the resume you already have</h2><p className="mb-7 mt-2 text-[var(--muted)]">We’ll extract a conservative draft for you to review.</p><ResumeUpload /></Card> : null}
      {profile ? <div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <Card className="p-6 sm:p-8"><h2 className="text-xl font-bold">Profile foundation</h2><p className="mb-6 mt-1 text-sm text-[var(--muted)]">Edit any value directly. Your edits are authoritative.</p><ProfileEditor profile={{ headline: profile.headline ?? "", summary: profile.summary ?? "", targetRole: profile.targetRole ?? "", preferredLocations: profile.preferredLocations, remotePreference: profile.remotePreference, careerGoals: profile.careerGoals }} /></Card>
        <div className="grid content-start gap-6"><Card className="p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Experience</h2><p className="mt-1 text-sm text-[var(--muted)]">Manual entries are verified because they come directly from you.</p></div><ExperienceForm /></div><div className="mt-6 grid gap-3">{profile.experiences.length ? profile.experiences.map((experience) => <div key={experience.id} className="rounded-2xl border border-[var(--line)] bg-white/55 p-4"><div className="flex justify-between gap-4"><div><p className="font-bold">{experience.title}</p><p className="text-sm text-[var(--muted)]">{experience.company}</p></div>{experience.verified ? <CheckCircle2 className="size-5 text-[var(--focus)]" /> : <CircleDashed className="size-5 text-amber-600" />}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{experience.description}</p></div>) : <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">No experience added yet.</p>}</div></Card>
        <Card className="p-6 sm:p-8"><h2 className="text-xl font-bold">Verified skills</h2><div className="mt-4 flex flex-wrap gap-2">{profile.careerSkills.length ? profile.careerSkills.map(({ skill }) => <span key={skill.id} className="rounded-full bg-[var(--lime)]/60 px-3 py-1.5 text-sm font-semibold">{skill.name}</span>) : <span className="text-sm text-[var(--muted)]">Add skills by reviewing a resume draft.</span>}</div></Card>
        {!pendingSuggestion ? <Card className="p-6"><details><summary className="cursor-pointer font-bold">Upload another base resume</summary><div className="mt-5"><ResumeUpload /></div></details></Card> : null}</div>
      </div> : null}
    </main>
  );
}
