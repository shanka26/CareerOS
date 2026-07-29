import { describe, expect, it } from "vitest";
import { canTransitionApplication } from "./status";

describe("application status transitions", () => {
  it("allows the documented forward pipeline", () => {
    expect(canTransitionApplication("READY", "APPLIED")).toBe(true);
    expect(canTransitionApplication("APPLIED", "RECRUITER_SCREEN")).toBe(true);
    expect(canTransitionApplication("FINAL_INTERVIEW", "OFFER")).toBe(true);
  });

  it("prevents skipping pipeline stages", () => {
    expect(canTransitionApplication("SAVED", "OFFER")).toBe(false);
    expect(canTransitionApplication("ARCHIVED", "READY")).toBe(false);
  });
});
