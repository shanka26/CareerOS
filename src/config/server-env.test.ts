import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./server-env";

describe("server environment", () => {
  it("keeps optional job providers disabled when credentials are absent", () => {
    const env = parseServerEnv({ NODE_ENV: "test" });
    expect(env).toMatchObject({ ADZUNA_COUNTRY: "us" });
    expect(env.ADZUNA_APP_ID).toBeUndefined();
  });

  it("rejects incomplete job provider credentials", () => {
    expect(() => parseServerEnv({ NODE_ENV: "test", ADZUNA_APP_ID: "app" })).toThrow();
    expect(() => parseServerEnv({ NODE_ENV: "test", USAJOBS_API_KEY: "key" })).toThrow();
  });

  it("accepts complete registered provider credentials", () => {
    expect(parseServerEnv({
      NODE_ENV: "test", ADZUNA_APP_ID: "app", ADZUNA_APP_KEY: "key",
      USAJOBS_API_KEY: "key", USAJOBS_USER_AGENT: "operator@example.com", THE_MUSE_API_KEY: "muse",
    })).toMatchObject({ ADZUNA_APP_ID: "app", USAJOBS_USER_AGENT: "operator@example.com", THE_MUSE_API_KEY: "muse" });
  });
});
