import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

import { googleAuthEnabled, requireRuntimeEnv, serverEnv } from "@/config/server-env";
import { prisma } from "@/shared/db/prisma";

const socialProviders = googleAuthEnabled
  ? { google: { clientId: serverEnv.GOOGLE_CLIENT_ID!, clientSecret: serverEnv.GOOGLE_CLIENT_SECRET!, prompt: "select_account" as const } }
  : undefined;

export const auth = betterAuth({
  appName: "CareerOS",
  baseURL: serverEnv.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: requireRuntimeEnv("BETTER_AUTH_SECRET"),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 10, maxPasswordLength: 128 },
  socialProviders,
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: true, maxAge: 60 * 5 } },
  advanced: { cookiePrefix: "careeros", useSecureCookies: serverEnv.NODE_ENV === "production" },
  rateLimit: { enabled: true, window: 60, max: 30 },
});

export type AuthSession = typeof auth.$Infer.Session;
