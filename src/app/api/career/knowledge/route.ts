import { NextResponse } from "next/server";
import { careerKnowledgeSchema } from "@/domains/career/knowledge-schema";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = careerKnowledgeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Review the career knowledge fields.", issues: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const profile = await prisma.careerProfile.upsert({ where: { userId: session.user.id }, update: {}, create: { userId: session.user.id } });

  if (data.kind === "skill") {
    const skill = await prisma.skill.upsert({ where: { name_category: { name: data.name, category: data.category } }, update: {}, create: { name: data.name, category: data.category } });
    await prisma.$transaction(async (transaction) => {
      if (data.id && data.id !== skill.id) {
        const existing = await transaction.careerSkill.findUnique({ where: { careerProfileId_skillId: { careerProfileId: profile.id, skillId: data.id } } });
        if (!existing) throw new Error("Skill not found.");
        await transaction.careerSkill.delete({ where: { careerProfileId_skillId: { careerProfileId: profile.id, skillId: data.id } } });
      }
      await transaction.careerSkill.upsert({ where: { careerProfileId_skillId: { careerProfileId: profile.id, skillId: skill.id } }, update: { proficiency: data.proficiency || null, verified: true, confidence: 1 }, create: { careerProfileId: profile.id, skillId: skill.id, proficiency: data.proficiency || null, verified: true, confidence: 1 } });
    });
    return NextResponse.json({ id: skill.id }, { status: data.id ? 200 : 201 });
  }

  if (data.kind === "achievement") {
    const experience = await prisma.experience.findFirst({ where: { id: data.experienceId, careerProfileId: profile.id } });
    if (!experience) return NextResponse.json({ error: "Experience not found." }, { status: 404 });
    const values = { description: data.description, metric: data.metric || null, quantified: data.quantified, verified: true };
    if (data.id) {
      const result = await prisma.achievement.updateMany({ where: { id: data.id, experienceId: experience.id }, data: values });
      if (!result.count) return NextResponse.json({ error: "Achievement not found." }, { status: 404 });
      return NextResponse.json({ id: data.id });
    }
    const created = await prisma.achievement.create({ data: { experienceId: experience.id, ...values } });
    return NextResponse.json({ id: created.id }, { status: 201 });
  }

  if (data.kind === "project") {
    const values = { name: data.name, description: data.description, impact: data.impact || null, technologies: data.technologies, verified: true };
    if (data.id) {
      const result = await prisma.project.updateMany({ where: { id: data.id, careerProfileId: profile.id }, data: values });
      if (!result.count) return NextResponse.json({ error: "Project not found." }, { status: 404 });
      return NextResponse.json({ id: data.id });
    }
    const created = await prisma.project.create({ data: { careerProfileId: profile.id, ...values } });
    return NextResponse.json({ id: created.id }, { status: 201 });
  }

  if (data.kind === "education") {
    const values = { school: data.school, degree: data.degree || null, field: data.field || null, graduationDate: data.graduationDate ?? null, verified: true };
    if (data.id) {
      const result = await prisma.education.updateMany({ where: { id: data.id, careerProfileId: profile.id }, data: values });
      if (!result.count) return NextResponse.json({ error: "Education record not found." }, { status: 404 });
      return NextResponse.json({ id: data.id });
    }
    const created = await prisma.education.create({ data: { careerProfileId: profile.id, ...values } });
    return NextResponse.json({ id: created.id }, { status: 201 });
  }

  const values = { name: data.name, issuer: data.issuer, issueDate: data.issueDate ?? null, expirationDate: data.expirationDate ?? null, verified: true };
  if (data.id) {
    const result = await prisma.certification.updateMany({ where: { id: data.id, careerProfileId: profile.id }, data: values });
    if (!result.count) return NextResponse.json({ error: "Certification not found." }, { status: 404 });
    return NextResponse.json({ id: data.id });
  }
  const created = await prisma.certification.create({ data: { careerProfileId: profile.id, ...values } });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
