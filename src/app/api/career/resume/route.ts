import { NextResponse } from "next/server";

import { getSession } from "@/domains/settings/auth/session";
import { analyzeResumeText } from "@/domains/career/resume/analysis";
import { extractResumeText } from "@/domains/career/resume/extract-text";
import { validateResumeFile } from "@/domains/career/resume/file-policy";
import { storeResume } from "@/domains/career/resume/storage";
import { transcribeResumeFile } from "@/domains/career/resume/transcribe-file";
import { prisma } from "@/shared/db/prisma";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let storedResume: Awaited<ReturnType<typeof storeResume>> | undefined;
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF or Word resume." }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = validateResumeFile(bytes, file.name);
    const rawText = await extractResumeText(bytes, kind, (fileBytes, fileKind) =>
      transcribeResumeFile(session.user.id, fileBytes, fileKind),
    );
    const { analysis, provenance } = await analyzeResumeText(session.user.id, rawText);
    const savedResume = await storeResume(session.user.id, bytes, kind);
    storedResume = savedResume;

    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          ownerId: session.user.id,
          type: "BASE_RESUME",
          status: "DRAFT",
          title: file.name.replace(/\.(pdf|docx?)$/i, ""),
          markdown: rawText,
          pdfPath: savedResume.location,
          versions: { create: { version: 1, markdown: rawText, pdfPath: savedResume.location } },
        },
      });
      const suggestion = await tx.memorySuggestion.create({
        data: {
          userId: session.user.id,
          source: `resume:${document.id}`,
          confidence: null,
          proposedFact: JSON.parse(JSON.stringify({ ...analysis, rawText, provenance })),
        },
      });
      return { documentId: document.id, suggestionId: suggestion.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (storedResume) await storedResume.remove().catch(() => undefined);
    const message = error instanceof Error ? error.message : "Resume processing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
