import { NextResponse } from "next/server";

import { createExperienceSchema } from "@/domains/career/experience-schema";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = createExperienceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Company, title, and description are required.", issues: parsed.error.flatten() }, { status: 400 });

  const profile = await prisma.careerProfile.upsert({ where: { userId: session.user.id }, update: {}, create: { userId: session.user.id } });
  const values = { company: parsed.data.company, title: parsed.data.title, description: parsed.data.description, current: parsed.data.current, startDate: parsed.data.startDate ?? null, endDate: parsed.data.endDate ?? null, verified: true };
  if (parsed.data.id) {
    const updated = await prisma.experience.updateMany({ where: { id: parsed.data.id, careerProfileId: profile.id }, data: values });
    if (!updated.count) return NextResponse.json({ error: "Experience not found." }, { status: 404 });
    return NextResponse.json({ id: parsed.data.id });
  }
  const experience = await prisma.experience.create({ data: { careerProfileId: profile.id, ...values } });
  return NextResponse.json({ id: experience.id }, { status: 201 });
}
