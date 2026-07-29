import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { approveResumeDraftSchema } from "@/domains/career/resume/schemas";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = approveResumeDraftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review the highlighted career profile fields.", issues: parsed.error.flatten() }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const suggestion = await tx.memorySuggestion.findFirst({ where: { id: parsed.data.suggestionId, userId: session.user.id, status: "PENDING" } });
      if (!suggestion) throw new Error("This resume suggestion is no longer pending.");

      const profile = await tx.careerProfile.upsert({
        where: { userId: session.user.id },
        update: {
          headline: parsed.data.headline || null,
          summary: parsed.data.summary || null,
          targetRole: parsed.data.targetRole || null,
          preferredLocations: parsed.data.preferredLocations,
          remotePreference: parsed.data.remotePreference,
          careerGoals: parsed.data.careerGoals,
          salaryExpectation: parsed.data.salaryExpectation ? { notes: parsed.data.salaryExpectation } : Prisma.JsonNull,
        },
        create: {
          userId: session.user.id,
          headline: parsed.data.headline || null,
          summary: parsed.data.summary || null,
          targetRole: parsed.data.targetRole || null,
          preferredLocations: parsed.data.preferredLocations,
          remotePreference: parsed.data.remotePreference,
          careerGoals: parsed.data.careerGoals,
          salaryExpectation: parsed.data.salaryExpectation ? { notes: parsed.data.salaryExpectation } : Prisma.JsonNull,
        },
      });

      for (const name of parsed.data.skills) {
        const skill = await tx.skill.upsert({ where: { name_category: { name, category: "Imported" } }, update: {}, create: { name, category: "Imported" } });
        await tx.careerSkill.upsert({
          where: { careerProfileId_skillId: { careerProfileId: profile.id, skillId: skill.id } },
          update: { verified: true },
          create: { careerProfileId: profile.id, skillId: skill.id, verified: true, confidence: 1 },
        });
      }

      await tx.memorySuggestion.update({ where: { id: suggestion.id }, data: { status: "ACCEPTED", reviewedAt: new Date() } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The profile could not be saved." }, { status: 409 });
  }
}
