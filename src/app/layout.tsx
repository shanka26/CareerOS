import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import { QueryProvider } from "@/shared/providers/query-provider";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "CareerOS - Your career, in context",
  description: "Build a verified career profile and turn it into stronger applications.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${display.variable}`}><body><QueryProvider>{children}</QueryProvider></body></html>;
}
