import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { updateCareerProfileSchema } from "@/domains/career/resume/schemas";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = updateCareerProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review the career profile fields.", issues: parsed.error.flatten() }, { status: 400 });

  const data = {
    headline: parsed.data.headline || null,
    summary: parsed.data.summary || null,
    targetRole: parsed.data.targetRole || null,
    preferredLocations: parsed.data.preferredLocations,
    remotePreference: parsed.data.remotePreference,
    careerGoals: parsed.data.careerGoals,
    salaryExpectation: parsed.data.salaryExpectation ? { notes: parsed.data.salaryExpectation } : Prisma.JsonNull,
  };
  await prisma.careerProfile.upsert({ where: { userId: session.user.id }, update: data, create: { userId: session.user.id, ...data } });
  return NextResponse.json({ ok: true });
}
