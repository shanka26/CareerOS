import { Layers3 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { requireSession } from "@/domains/settings/auth/session";
import { SignOutButton } from "@/domains/settings/auth/sign-out-button";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--paper)]/85 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[var(--ink)] text-[var(--paper)]"><Layers3 className="size-4" /></span>CareerOS</Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Workspace"><Link href="/dashboard" className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-white">Home</Link><Link href="/dashboard/career" className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-white">Career profile</Link></nav>
          <div className="flex items-center gap-2"><span className="hidden text-sm font-semibold sm:inline">{session.user.name}</span><SignOutButton /></div>
        </div>
      </header>
      {children}
    </div>
  );
}
