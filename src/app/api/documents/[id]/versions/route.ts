import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/domains/settings/auth/session";
import { buildUserEditedVersion } from "@/domains/documents/version-provenance";
import { prisma } from "@/shared/db/prisma";

const schema = z.object({ markdown: z.string().min(1).max(100_000), explanation: z.string().max(1_000).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Document content is required." }, { status: 400 });
  const { id } = await params;
  const document = await prisma.document.findFirst({ where: { id, ownerId: session.user.id }, include: { versions: { orderBy: { version: "desc" }, take: 1 } } });
  if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const version = await prisma.$transaction(async (tx) => {
    const created = await tx.documentVersion.create({ data: { documentId: document.id, ...buildUserEditedVersion(document.versions[0], parsed.data.markdown, parsed.data.explanation) } });
    await tx.document.update({ where: { id: document.id }, data: { markdown: parsed.data.markdown } });
    return created;
  });
  return NextResponse.json({ id: version.id, version: version.version }, { status: 201 });
}
