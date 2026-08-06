import Link from "next/link";

export type JobsTab = "my-jobs" | "find-job";

const tabs: Array<{ id: JobsTab; label: string; href: string }> = [
  { id: "my-jobs", label: "My Jobs", href: "/dashboard/jobs" },
  { id: "find-job", label: "Find Job", href: "/dashboard/jobs?tab=find-job" },
];

export function JobsTabs({ activeTab }: { activeTab: JobsTab }) {
  return (
    <nav aria-label="Jobs views" className="mt-8 border-b border-[var(--line)]">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              id={`${tab.id}-tab`}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative min-h-12 rounded-t-xl px-5 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${active ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
