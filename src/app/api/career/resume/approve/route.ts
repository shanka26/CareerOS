import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { approveResumeAnalysisSchema } from "@/domains/career/resume/schemas";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = approveResumeAnalysisSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review the highlighted career profile fields.", issues: parsed.error.flatten() }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const suggestion = await tx.memorySuggestion.findFirst({ where: { id: parsed.data.suggestionId, userId: session.user.id, status: "PENDING" } });
      if (!suggestion) throw new Error("This resume suggestion is no longer pending.");

      const profile = await tx.careerProfile.upsert({
        where: { userId: session.user.id },
        update: {
          headline: parsed.data.headline,
          summary: parsed.data.summary,
          targetRole: parsed.data.targetRole,
          preferredLocations: parsed.data.preferredLocations,
          remotePreference: parsed.data.remotePreference,
          careerGoals: parsed.data.careerGoals,
          salaryExpectation: parsed.data.salaryExpectation ? { notes: parsed.data.salaryExpectation } : Prisma.JsonNull,
        },
        create: {
          userId: session.user.id,
          headline: parsed.data.headline,
          summary: parsed.data.summary,
          targetRole: parsed.data.targetRole,
          preferredLocations: parsed.data.preferredLocations,
          remotePreference: parsed.data.remotePreference,
          careerGoals: parsed.data.careerGoals,
          salaryExpectation: parsed.data.salaryExpectation ? { notes: parsed.data.salaryExpectation } : Prisma.JsonNull,
        },
      });

      for (const item of parsed.data.skills) {
        const skill = await tx.skill.upsert({ where: { name_category: { name: item.name, category: item.category } }, update: {}, create: { name: item.name, category: item.category } });
        await tx.careerSkill.upsert({
          where: { careerProfileId_skillId: { careerProfileId: profile.id, skillId: skill.id } },
          update: { proficiency: item.proficiency, verified: true, confidence: 1 },
          create: { careerProfileId: profile.id, skillId: skill.id, proficiency: item.proficiency, verified: true, confidence: 1 },
        });
      }

      for (const item of parsed.data.experiences) {
        const startDate = resumeDate(item.startDate);
        const endDate = resumeDate(item.endDate);
        const existing = await tx.experience.findFirst({
          where: { careerProfileId: profile.id, company: item.company, title: item.title, startDate },
        });
        const values = {
          company: item.company,
          title: item.title,
          startDate,
          endDate,
          current: item.current ?? false,
          description: item.description,
          verified: true,
        };
        const experience = existing
          ? await tx.experience.update({ where: { id: existing.id }, data: values })
          : await tx.experience.create({ data: { careerProfileId: profile.id, ...values } });

        for (const achievement of item.achievements) {
          const prior = await tx.achievement.findFirst({ where: { experienceId: experience.id, description: achievement.description } });
          const achievementValues = { metric: achievement.metric, quantified: achievement.quantified, verified: true };
          if (prior) await tx.achievement.update({ where: { id: prior.id }, data: achievementValues });
          else await tx.achievement.create({ data: { experienceId: experience.id, description: achievement.description, ...achievementValues } });
        }
      }

      for (const item of parsed.data.projects) {
        const existing = await tx.project.findFirst({ where: { careerProfileId: profile.id, name: item.name } });
        const values = { description: item.description, impact: item.impact, technologies: item.technologies, verified: true };
        if (existing) await tx.project.update({ where: { id: existing.id }, data: values });
        else await tx.project.create({ data: { careerProfileId: profile.id, name: item.name, ...values } });
      }

      for (const item of parsed.data.education) {
        const graduationDate = resumeDate(item.graduationDate);
        const existing = await tx.education.findFirst({ where: { careerProfileId: profile.id, school: item.school, degree: item.degree } });
        const values = { field: item.field, graduationDate, verified: true };
        if (existing) await tx.education.update({ where: { id: existing.id }, data: values });
        else await tx.education.create({ data: { careerProfileId: profile.id, school: item.school, degree: item.degree, ...values } });
      }

      for (const item of parsed.data.certifications) {
        const existing = await tx.certification.findFirst({ where: { careerProfileId: profile.id, name: item.name, issuer: item.issuer } });
        const values = { issueDate: resumeDate(item.issueDate), expirationDate: resumeDate(item.expirationDate), verified: true };
        if (existing) await tx.certification.update({ where: { id: existing.id }, data: values });
        else await tx.certification.create({ data: { careerProfileId: profile.id, name: item.name, issuer: item.issuer, ...values } });
      }

      await tx.memorySuggestion.update({ where: { id: suggestion.id }, data: { status: "ACCEPTED", reviewedAt: new Date() } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The profile could not be saved." }, { status: 409 });
  }
}

function resumeDate(value: string | null) {
  if (!value) return null;
  const iso = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
  return new Date(`${iso}T00:00:00.000Z`);
}
