import { NextResponse } from "next/server";
import { renderDocumentPdf } from "@/domains/documents/pdf";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const versionNumber = Number(new URL(request.url).searchParams.get("version"));
  const versionWhere = Number.isInteger(versionNumber) && versionNumber > 0 ? { version: versionNumber } : {};
  const document = await prisma.document.findFirst({ where: { id, ownerId: session.user.id }, include: { versions: { where: versionWhere, orderBy: { version: "desc" }, take: 1 } } });
  const version = document?.versions[0];
  if (!document || !version) return NextResponse.json({ error: "Document version not found." }, { status: 404 });
  const pdf = await renderDocumentPdf(document.title, version.markdown);
  return new NextResponse(Buffer.from(pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${document.title.replace(/[^a-z0-9_-]+/gi, "-")}-v${version.version}.pdf"`, "cache-control": "private, no-store" } });
}
