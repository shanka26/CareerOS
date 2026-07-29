import { describe, expect, it } from "vitest";

import { calculateProfileCompleteness } from "./completeness";

describe("career profile completeness", () => {
  it("handles an empty profile", () => {
    expect(calculateProfileCompleteness({ experienceCount: 0, skillCount: 0, educationCount: 0 })).toBe(0);
  });

  it("reaches 100 only when each foundation category is present", () => {
    expect(calculateProfileCompleteness({ headline: "Engineer", summary: "Builder", targetRole: "Staff Engineer", preferredLocations: ["Remote"], experienceCount: 1, skillCount: 1, educationCount: 1 })).toBe(100);
  });
});
