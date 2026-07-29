import { describe, expect, it } from "vitest";
import { assertGroundedClaims } from "./grounding";

describe("AI factual grounding", () => {
  it("accepts claims whose citations are all verified", () => {
    expect(assertGroundedClaims([{ text: "Built systems", factIds: ["exp-1"], explanation: "Relevant experience" }], new Set(["exp-1"]))).toHaveLength(1);
  });
  it("rejects unknown factual citations", () => {
    expect(() => assertGroundedClaims([{ text: "Grew revenue 50%", factIds: ["invented"], explanation: "Impact" }], new Set(["exp-1"]))).toThrow("unverified or unknown");
  });
});
