import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/cn";

export function ProcessingIndicator({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--line)] bg-white/80 shadow-sm",
        compact ? "p-3" : "p-5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--lime)]">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold text-[var(--ink)]">{title}</p>
          <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{description}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden="true">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--focus)]" />
      </div>
    </div>
  );
}
