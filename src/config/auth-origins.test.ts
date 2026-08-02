import { describe, expect, it } from "vitest";

import { getAuthOriginConfig } from "./auth-origins";

describe("authentication origins", () => {
  it("uses localhost during local development", () => {
    expect(getAuthOriginConfig({ BETTER_AUTH_URL: "http://localhost:3000", NODE_ENV: "development" })).toEqual({
      baseURL: "http://localhost:3000",
      trustedOrigins: ["http://localhost:3000"],
    });
  });

  it("trusts exact Vercel deployment, branch, and production origins", () => {
    const config = getAuthOriginConfig({
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_URL: "careeros-a1b2.vercel.app",
      VERCEL_BRANCH_URL: "careeros-git-main.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "careeros.example.com",
    });

    expect(config).toEqual({
      baseURL: "https://careeros-a1b2.vercel.app",
      trustedOrigins: [
        "https://careeros-a1b2.vercel.app",
        "https://careeros-git-main.vercel.app",
        "https://careeros.example.com",
      ],
    });
  });

  it("keeps an explicit production domain canonical on Vercel", () => {
    const config = getAuthOriginConfig({
      BETTER_AUTH_URL: "https://careeros.example.com",
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_URL: "careeros-a1b2.vercel.app",
    });

    expect(config.baseURL).toBe("https://careeros.example.com");
    expect(config.trustedOrigins).toContain("https://careeros-a1b2.vercel.app");
  });

  it("replaces an accidentally deployed localhost URL with the Vercel deployment URL", () => {
    const config = getAuthOriginConfig({
      BETTER_AUTH_URL: "http://localhost:3000",
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_URL: "careeros-a1b2.vercel.app",
    });

    expect(config.baseURL).toBe("https://careeros-a1b2.vercel.app");
    expect(config.trustedOrigins).not.toContain("http://localhost:3000");
  });
});
