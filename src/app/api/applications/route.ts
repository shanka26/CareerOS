import { NextResponse } from "next/server";
import { z } from "zod";
import { applicationArtifactLinksSchema } from "@/domains/applications/artifact-links";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  resumeDocumentId: z.string().min(1),
  resumeVersionId: z.string().min(1),
  coverLetterDocumentId: z.string().min(1),
  coverLetterVersionId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = createApplicationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Select a job and exact document versions." }, { status: 400 });
  const data = parsed.data;
  const links = applicationArtifactLinksSchema.safeParse({ ...data, status: "READY" });
  if (!links.success) return NextResponse.json({ error: links.error.issues[0]?.message }, { status: 400 });

  const [job, resumeVersion, coverVersion] = await Promise.all([
    prisma.jobPosting.findFirst({ where: { id: data.jobId, ownerId: session.user.id } }),
    prisma.documentVersion.findFirst({
      where: { id: data.resumeVersionId, documentId: data.resumeDocumentId, document: { ownerId: session.user.id, type: "GENERATED_RESUME" } },
    }),
    prisma.documentVersion.findFirst({
      where: { id: data.coverLetterVersionId, documentId: data.coverLetterDocumentId, document: { ownerId: session.user.id, type: "GENERATED_COVER_LETTER" } },
    }),
  ]);
  if (!job || !resumeVersion || !coverVersion) {
    return NextResponse.json({ error: "The job or selected document version is unavailable." }, { status: 404 });
  }

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      jobId: data.jobId,
      status: "READY",
      resumeDocumentId: data.resumeDocumentId,
      resumeVersionId: data.resumeVersionId,
      coverLetterDocumentId: data.coverLetterDocumentId,
      coverLetterVersionId: data.coverLetterVersionId,
      timelineEvents: { create: { type: "STATUS", title: "Application created as Ready" } },
    },
  });
  return NextResponse.json({ applicationId: application.id }, { status: 201 });
}
