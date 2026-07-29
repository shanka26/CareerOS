import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "./schemas";

describe("authentication schemas", () => {
  it("accepts a valid sign-up", () => {
    expect(signUpSchema.safeParse({ name: "Ada Lovelace", email: "ada@example.com", password: "Analytical1", confirmPassword: "Analytical1" }).success).toBe(true);
  });

  it("rejects weak or mismatched passwords", () => {
    expect(signUpSchema.safeParse({ name: "Ada", email: "ada@example.com", password: "weak", confirmPassword: "different" }).success).toBe(false);
  });

  it("requires valid sign-in credentials", () => {
    expect(signInSchema.safeParse({ email: "invalid", password: "" }).success).toBe(false);
  });
});
