import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeJobText } from "@/domains/jobs/analyze";
import { fetchPublicJobText } from "@/domains/jobs/safe-fetch";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

const schema = z.object({ text: z.string().max(100_000).optional(), url: z.url().optional() }).refine((value) => Boolean(value.text?.trim()) !== Boolean(value.url), "Provide pasted text or one URL.");

export async function POST(request: Request) {
  const session = await getSession(); if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Paste a job description or enter one HTTPS URL." }, { status: 400 });
  try {
    const text = parsed.data.url ? await fetchPublicJobText(parsed.data.url) : parsed.data.text!.trim();
    const profile = await prisma.careerProfile.findUnique({ where: { userId: session.user.id }, include: { careerSkills: { where: { verified: true }, include: { skill: true } } } });
    const analysis = analyzeJobText(text, profile?.careerSkills.map(({ skill }) => skill.name) ?? []);
    const job = await prisma.jobPosting.create({ data: { ownerId: session.user.id, source: parsed.data.url ? "URL" : "PASTE", url: parsed.data.url ?? null, companyName: analysis.company, title: analysis.title, description: text, parsedRequirements: analysis.requirements, analysis, matchScore: analysis.score, status: "ANALYZED" } });
    return NextResponse.json({ id: job.id }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Job import failed." }, { status: 400 }); }
}
