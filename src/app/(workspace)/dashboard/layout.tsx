import { Layers3 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireSession } from "@/domains/settings/auth/session";
import { SignOutButton } from "@/domains/settings/auth/sign-out-button";

const navigation = [
  ["Home", "/dashboard"], ["Career", "/dashboard/career"], ["Jobs", "/dashboard/jobs"],
  ["Documents", "/dashboard/documents"], ["Applications", "/dashboard/applications"],
  ["Assistant", "/dashboard/assistant"], ["Analytics", "/dashboard/analytics"], ["Settings", "/dashboard/settings"],
] as const;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return <div className="min-h-screen"><header className="border-b border-[var(--line)] bg-[var(--paper)]/90 px-5 py-3 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Link href="/dashboard" className="flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[var(--ink)] text-[var(--paper)]"><Layers3 className="size-4" /></span>CareerOS</Link><div className="flex items-center gap-2"><span className="hidden text-sm font-semibold sm:inline">{session.user.name}</span><SignOutButton /></div></div><nav className="mx-auto mt-3 flex max-w-7xl gap-1 overflow-x-auto pb-1" aria-label="Workspace">{navigation.map(([label, href]) => <Link href={href} key={href} className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-white hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">{label}</Link>)}</nav></header>{children}</div>;
}
