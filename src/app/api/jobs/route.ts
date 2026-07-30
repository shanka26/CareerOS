import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeJobText } from "@/domains/jobs/analyze";
import { fetchPublicJobText } from "@/domains/jobs/safe-fetch";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

const discoveredJobSchema = z.object({
  source: z.literal("Remotive"), sourceId: z.string().max(100), sourceUrl: z.url(), title: z.string().trim().min(1).max(120), company: z.string().trim().min(1).max(120),
  location: z.string().trim().max(200), employmentType: z.string().trim().max(100).nullable(), category: z.string().trim().max(100).nullable(), salary: z.string().trim().max(200).nullable(), publishedAt: z.string().nullable(), description: z.string().trim().min(1).max(100_000),
}).refine((job) => { const url = new URL(job.sourceUrl); return url.protocol === "https:" && (url.hostname === "remotive.com" || url.hostname === "www.remotive.com"); }, "Invalid discovery source URL.");
const schema = z.union([
  z.object({ text: z.string().max(100_000).optional(), url: z.url().optional() }).refine((value) => Boolean(value.text?.trim()) !== Boolean(value.url), "Provide pasted text or one URL."),
  z.object({ discoveredJob: discoveredJobSchema }),
]);

export async function POST(request: Request) {
  const session = await getSession(); if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Paste a job description or enter one HTTPS URL." }, { status: 400 });
  try {
    const discovered = "discoveredJob" in parsed.data ? parsed.data.discoveredJob : null;
    if (discovered) {
      const existing = await prisma.jobPosting.findFirst({ where: { ownerId: session.user.id, url: discovered.sourceUrl }, select: { id: true } });
      if (existing) return NextResponse.json({ id: existing.id, duplicate: true });
    }
    const directImport = "discoveredJob" in parsed.data ? null : parsed.data;
    const sourceUrl = discovered?.sourceUrl ?? directImport?.url;
    const text = discovered ? [`Title: ${discovered.title}`, `Company: ${discovered.company}`, `Location: ${discovered.location}`, discovered.employmentType ? `Employment type: ${discovered.employmentType}` : "", discovered.salary ? `Salary: ${discovered.salary}` : "", "", discovered.description].filter(Boolean).join("\n") : directImport?.url ? await fetchPublicJobText(directImport.url) : directImport!.text!.trim();
    const profile = await prisma.careerProfile.findUnique({ where: { userId: session.user.id }, include: { careerSkills: { where: { verified: true }, include: { skill: true } } } });
    const analysis = analyzeJobText(text, profile?.careerSkills.map(({ skill }) => skill.name) ?? []);
    const company = await prisma.company.upsert({ where: { ownerId_name: { ownerId: session.user.id, name: analysis.company } }, update: {}, create: { ownerId: session.user.id, name: analysis.company, website: sourceUrl ? new URL(sourceUrl).origin : null } });
    const job = await prisma.jobPosting.create({ data: { ownerId: session.user.id, companyId: company.id, source: sourceUrl ? "URL" : "PASTE", url: sourceUrl ?? null, companyName: analysis.company, title: analysis.title, location: analysis.location, employmentType: analysis.employmentType, ...(analysis.salary ? { salary: analysis.salary } : {}), description: text, parsedRequirements: analysis.requirements, analysis: discovered ? { ...analysis, discoverySource: discovered.source, discoverySourceId: discovered.sourceId, publishedAt: discovered.publishedAt, category: discovered.category } : analysis, matchScore: analysis.score, status: "ANALYZED" } });
    return NextResponse.json({ id: job.id }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Job import failed." }, { status: 400 }); }
}
