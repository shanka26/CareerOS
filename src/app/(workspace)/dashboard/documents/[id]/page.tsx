import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { DocumentEditor } from "@/domains/documents/document-editor";
import { requireSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";
import { Card } from "@/shared/ui/card";

export default async function DocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ version?: string }> }) {
  const session = await requireSession(); const { id } = await params; const query = await searchParams;
  const document = await prisma.document.findFirst({ where: { id, ownerId: session.user.id }, include: { versions: { orderBy: { version: "desc" }, include: { knowledgeSnapshot: { select: { checksum: true, createdAt: true } } } } } });
  if (!document) notFound();
  const selected = document.versions.find((version) => version.version === Number(query.version)) ?? document.versions[0];
  if (!selected) notFound();
  return <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">{document.type.replaceAll("_", " ")}</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">{document.title}</h1></div><a href={`/api/documents/${id}/export?version=${selected.version}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-[var(--paper)]"><Download className="size-4" />Export v{selected.version} PDF</a></div><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]"><Card className="p-6"><DocumentEditor id={id} markdown={selected.markdown} /></Card><div className="grid content-start gap-4"><Card className="p-5"><h2 className="font-bold">Versions</h2><div className="mt-3 grid gap-2">{document.versions.map((version) => <a key={version.id} href={`?version=${version.version}`} className={`rounded-xl p-3 text-sm ${version.id === selected.id ? "bg-[var(--lime)]/60 font-bold" : "bg-white/60"}`}>Version {version.version}<span className="block text-xs font-normal text-[var(--muted)]">{version.createdAt.toLocaleDateString()}</span></a>)}</div></Card><Card className="p-5 text-sm"><h2 className="font-bold">Provenance</h2><dl className="mt-3 grid gap-2 text-[var(--muted)]"><div><dt>Model</dt><dd className="font-semibold text-[var(--ink)]">{selected.aiModel ?? "User authored"}</dd></div><div><dt>Prompt</dt><dd>{selected.promptVersion ?? "—"}</dd></div><div><dt>Knowledge snapshot</dt><dd className="break-all">{selected.knowledgeSnapshot?.checksum ?? "Base source"}</dd></div></dl></Card></div></div></main>;
}
