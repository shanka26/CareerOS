import "server-only";

import { z } from "zod";

const optionalCredential = z.string().trim().min(1).optional();

const serverEnvSchema = z
  .object({
    DATABASE_URL: z.string().trim().min(1).optional(),
    DIRECT_URL: z.string().trim().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().trim().min(32).optional(),
    BETTER_AUTH_URL: z.url().optional(),
    GOOGLE_CLIENT_ID: optionalCredential,
    GOOGLE_CLIENT_SECRET: optionalCredential,
    OPENAI_API_KEY: optionalCredential,
    OPENAI_MODEL: z.string().trim().min(1).default("gpt-5.6-terra"),
    VERCEL: optionalCredential,
    VERCEL_URL: optionalCredential,
    VERCEL_BRANCH_URL: optionalCredential,
    VERCEL_PROJECT_PRODUCTION_URL: optionalCredential,
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PHASE: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (Boolean(value.GOOGLE_CLIENT_ID) !== Boolean(value.GOOGLE_CLIENT_SECRET)) {
      context.addIssue({ code: "custom", path: ["GOOGLE_CLIENT_ID"], message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together." });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(source);
}

export const serverEnv = parseServerEnv(process.env);
export const isProductionBuild = serverEnv.NEXT_PHASE === "phase-production-build";

export function requireRuntimeEnv(key: "DATABASE_URL" | "BETTER_AUTH_SECRET"): string {
  const value = serverEnv[key];
  if (value) return value;
  if (isProductionBuild || serverEnv.NODE_ENV === "test") {
    return key === "DATABASE_URL"
      ? "postgresql://build:build@127.0.0.1:5432/careeros_build"
      : "build-only-secret-that-must-never-run-in-production";
  }
  throw new Error(`${key} is required to run authentication. Copy .env.example to .env.local and configure it.`);
}

export const googleAuthEnabled = Boolean(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET);
export const openAIEnabled = Boolean(serverEnv.OPENAI_API_KEY);
