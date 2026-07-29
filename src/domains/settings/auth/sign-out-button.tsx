"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "./client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <button type="button" disabled={pending} onClick={async () => { setPending(true); await authClient.signOut(); router.push("/"); router.refresh(); }} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-white disabled:opacity-50">
      <LogOut className="size-4" aria-hidden="true" />{pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
