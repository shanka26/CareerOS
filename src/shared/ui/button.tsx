import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ink)] px-5 py-3 text-[var(--paper)] shadow-[0_8px_24px_rgba(20,28,24,.18)] hover:-translate-y-0.5",
        secondary:
          "border border-[var(--line)] bg-white/70 px-5 py-3 text-[var(--ink)] hover:bg-white",
        ghost: "px-3 py-2 text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]",
      },
      size: {
        default: "min-h-11 text-sm",
        small: "min-h-9 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
