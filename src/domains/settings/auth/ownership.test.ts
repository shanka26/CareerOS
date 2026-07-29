import { describe, expect, it } from "vitest";

import { assertResourceOwner, ownsResource } from "./ownership";

describe("resource ownership", () => {
  it("allows only matching user ids", () => {
    expect(ownsResource("user-a", "user-a")).toBe(true);
    expect(ownsResource("user-a", "user-b")).toBe(false);
  });

  it("does not disclose a forbidden resource", () => {
    expect(() => assertResourceOwner("user-a", "user-b")).toThrow("Resource not found.");
  });
});
