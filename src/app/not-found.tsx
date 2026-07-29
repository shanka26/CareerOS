import Link from "next/link";
import { buttonVariants } from "@/shared/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5 text-center"><div><p className="text-sm font-bold uppercase text-[var(--accent)]">404</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl">This path is not in your career map.</h1><Link className={`${buttonVariants()} mt-7`} href="/dashboard">Return to CareerOS</Link></div></main>;
}
