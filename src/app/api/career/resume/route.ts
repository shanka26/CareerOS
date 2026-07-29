import { unlink } from "node:fs/promises";
import { NextResponse } from "next/server";

import { getSession } from "@/domains/settings/auth/session";
import { buildConservativeResumeDraft } from "@/domains/career/resume/draft";
import { extractResumeText } from "@/domains/career/resume/extract-text";
import { validateResumeFile } from "@/domains/career/resume/file-policy";
import { storeResumeLocally } from "@/domains/career/resume/local-storage";
import { prisma } from "@/shared/db/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let storedPath: string | undefined;
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF or DOCX resume." }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = validateResumeFile(bytes, file.name);
    const rawText = await extractResumeText(bytes, kind);
    const draft = buildConservativeResumeDraft(rawText);
    const savedPath = await storeResumeLocally(session.user.id, bytes, kind);
    storedPath = savedPath;

    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          ownerId: session.user.id,
          type: "BASE_RESUME",
          status: "DRAFT",
          title: file.name.replace(/\.(pdf|docx)$/i, ""),
          markdown: rawText,
          pdfPath: savedPath,
          versions: { create: { version: 1, markdown: rawText, pdfPath: savedPath } },
        },
      });
      const suggestion = await tx.memorySuggestion.create({
        data: { userId: session.user.id, source: `resume:${document.id}`, confidence: 0.6, proposedFact: JSON.parse(JSON.stringify(draft)) },
      });
      return { documentId: document.id, suggestionId: suggestion.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (storedPath) await unlink(storedPath).catch(() => undefined);
    const message = error instanceof Error ? error.message : "Resume processing failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
