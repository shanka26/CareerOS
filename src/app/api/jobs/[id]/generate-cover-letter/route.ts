import { NextResponse } from "next/server";
import { checksumKnowledgeFacts } from "@/domains/career/knowledge-snapshot";
import { composeVerifiedCoverLetter } from "@/domains/documents/cover-letter-composer";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const [job, profile] = await Promise.all([
    prisma.jobPosting.findFirst({ where: { id, ownerId: session.user.id } }),
    prisma.careerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        experiences: { where: { verified: true } },
        careerSkills: { where: { verified: true }, include: { skill: true } },
      },
    }),
  ]);
  if (!job || !profile) {
    return NextResponse.json(
      { error: "A job and verified Career Profile are required." },
      { status: 400 },
    );
  }

  const facts = {
    name: session.user.name,
    headline: profile.headline,
    summary: profile.summary,
    skills: profile.careerSkills.map(({ skill }) => ({ id: skill.id, name: skill.name })),
    experiences: profile.experiences.map((experience) => ({
      id: experience.id,
      company: experience.company,
      title: experience.title,
      description: experience.description,
    })),
  };
  const composed = composeVerifiedCoverLetter(facts, {
    title: job.title,
    company: job.companyName,
  });
  const checksum = checksumKnowledgeFacts(facts);
  const document = await prisma.$transaction(async (transaction) => {
    const snapshot = await transaction.knowledgeSnapshot.upsert({
      where: { userId_checksum: { userId: session.user.id, checksum } },
      update: {},
      create: { userId: session.user.id, checksum, facts },
    });
    return transaction.document.create({
      data: {
        ownerId: session.user.id,
        type: "GENERATED_COVER_LETTER",
        title: `${job.companyName} - ${job.title} Cover Letter`,
        markdown: composed.markdown,
        versions: {
          create: {
            version: 1,
            markdown: composed.markdown,
            aiProvider: "deterministic",
            aiModel: "verified-fact-strategy/v1",
            promptVersion: "generate-cover-letter/v1",
            knowledgeSnapshotId: snapshot.id,
            changeExplanation: composed.explanations,
          },
        },
      },
    });
  });
  return NextResponse.json({ documentId: document.id }, { status: 201 });
}
