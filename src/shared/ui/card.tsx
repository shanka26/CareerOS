import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-[var(--line)] bg-white/75 shadow-[0_24px_80px_rgba(27,35,31,.08)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
