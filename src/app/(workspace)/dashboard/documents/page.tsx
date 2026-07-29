import { FileText } from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function DocumentsPage() {
  const session = await requireSession();
  const documents = await prisma.document.findMany({ where: { ownerId: session.user.id }, include: { versions: { orderBy: { version: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  return <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">Artifact library</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-[-.04em]">Documents, with a memory.</h1><p className="mt-3 text-[var(--muted)]">Every save creates a version. Generated artifacts retain model, prompt, snapshot, and explanation provenance.</p><div className="mt-9 grid gap-4 md:grid-cols-2">{documents.map((document) => <Link key={document.id} href={`/dashboard/documents/${document.id}`}><Card className="h-full p-6 transition hover:-translate-y-1"><FileText className="size-6 text-[var(--focus)]" /><h2 className="mt-5 text-xl font-bold">{document.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{document.type.replaceAll("_", " ")} · v{document.versions[0]?.version ?? 0}</p></Card></Link>)}{!documents.length ? <Card className="p-8 text-[var(--muted)]">Upload a resume from Career Profile to create your first base document.</Card> : null}</div></main>;
}
