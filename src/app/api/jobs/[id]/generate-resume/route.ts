import { NextResponse } from "next/server";
import { promptVersions } from "@/domains/assistant/capabilities";
import { createSafetyIdentifier, getConfiguredAIModel, getConfiguredAIProvider } from "@/domains/assistant/runtime";
import { checksumKnowledgeFacts } from "@/domains/career/knowledge-snapshot";
import {
  assertGroundedDocument,
  buildGenerationFactCatalog,
  generatedDocumentSchema,
  resumeGenerationInstructions,
} from "@/domains/documents/ai-document-generation";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const started = Date.now();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const provider = getConfiguredAIProvider();
  if (!provider) return NextResponse.json({ error: "AI document generation is not configured." }, { status: 503 });
  const { id } = await params;
  const [job, profile] = await Promise.all([
    prisma.jobPosting.findFirst({ where: { id, ownerId: session.user.id } }),
    prisma.careerProfile.findUnique({ where: { userId: session.user.id }, include: { experiences: { where: { verified: true }, include: { achievements: { where: { verified: true } } } }, projects: { where: { verified: true } }, education: { where: { verified: true } }, certifications: { where: { verified: true } }, careerSkills: { where: { verified: true }, include: { skill: true } } } }),
  ]);
  if (!job || !profile) return NextResponse.json({ error: "A job and verified Career Profile are required." }, { status: 400 });
  const facts = {
    name: session.user.name,
    headline: profile.headline,
    summary: profile.summary,
    targetRole: profile.targetRole,
    preferredLocations: profile.preferredLocations,
    remotePreference: profile.remotePreference,
    careerGoals: profile.careerGoals,
    skills: profile.careerSkills.map(({ skill, proficiency }) => ({ id: skill.id, name: skill.name, proficiency })),
    experiences: profile.experiences.map((experience) => ({ id: experience.id, company: experience.company, title: experience.title, startDate: experience.startDate?.toISOString() ?? null, endDate: experience.endDate?.toISOString() ?? null, current: experience.current, description: experience.description, achievements: experience.achievements.map((achievement) => ({ id: achievement.id, description: achievement.description, metric: achievement.metric })) })),
    projects: profile.projects.map((project) => ({ id: project.id, name: project.name, description: project.description, impact: project.impact, technologies: project.technologies })),
    education: profile.education.map((education) => ({ id: education.id, school: education.school, degree: education.degree, field: education.field, graduationDate: education.graduationDate?.toISOString() ?? null })),
    certifications: profile.certifications.map((certification) => ({ id: certification.id, name: certification.name, issuer: certification.issuer, issueDate: certification.issueDate?.toISOString() ?? null, expirationDate: certification.expirationDate?.toISOString() ?? null })),
  };
  const checksum = checksumKnowledgeFacts(facts);
  const snapshot = await prisma.knowledgeSnapshot.upsert({
    where: { userId_checksum: { userId: session.user.id, checksum } },
    update: {},
    create: { userId: session.user.id, checksum, facts },
  });
  const factCatalog = buildGenerationFactCatalog(facts, { title: job.title, company: job.companyName, description: job.description });
  let generated;
  try {
    const result = await provider.generate({
      capability: "generate-resume",
      instructions: resumeGenerationInstructions,
      input: { factCatalog },
      outputSchema: generatedDocumentSchema,
      schemaName: "career_resume",
      safetyIdentifier: createSafetyIdentifier(session.user.id),
    });
    generated = { ...result, data: assertGroundedDocument(result.data, factCatalog) };
  } catch (error) {
    await prisma.generationLog.create({
      data: {
        userId: session.user.id,
        provider: "openai",
        model: getConfiguredAIModel(),
        action: "generate-resume",
        promptVersion: promptVersions["generate-resume"],
        inputSnapshotId: snapshot.id,
        durationMs: Date.now() - started,
        success: false,
        errorCode: error instanceof Error ? error.name : "UnknownError",
      },
    }).catch(() => undefined);
    return NextResponse.json({ error: "AI resume generation failed. Please try again." }, { status: 502 });
  }
  const document = await prisma.$transaction(async (transaction) => {
    const created = await transaction.document.create({
      data: { ownerId: session.user.id, type: "GENERATED_RESUME", title: `${job.companyName} - ${job.title} Resume`, markdown: generated.data.markdown, versions: { create: { version: 1, markdown: generated.data.markdown, aiProvider: generated.provider, aiModel: generated.model, promptVersion: promptVersions["generate-resume"], knowledgeSnapshotId: snapshot.id, changeExplanation: generated.data.explanations } } },
      include: { versions: true },
    });
    await transaction.generationLog.create({ data: { userId: session.user.id, provider: generated.provider, model: generated.model, action: "generate-resume", promptVersion: promptVersions["generate-resume"], inputSnapshotId: snapshot.id, outputDocumentId: created.versions[0]!.id, durationMs: generated.durationMs, success: true } });
    return created;
  });
  return NextResponse.json({ documentId: document.id }, { status: 201 });
}
