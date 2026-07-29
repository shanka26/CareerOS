import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "./env";

describe("public environment", () => {
  it("uses a safe local default", () => {
    expect(parsePublicEnv({}).NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects malformed public URLs", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_URL: "not a URL" })).toThrow();
  });
});
