import { describe, expect, it } from "vitest";
import { calculateCareerMetrics } from "./metrics";

describe("career analytics", () => {
  it("returns honest zero rates before any submission", () => {
    expect(calculateCareerMetrics([{ status: "READY", applied: false }])).toEqual({ tracked: 1, submitted: 0, responses: 0, interviews: 0, offers: 0, responseRate: 0, interviewRate: 0, offerRate: 0 });
  });
  it("calculates rates from submitted applications", () => {
    const metrics = calculateCareerMetrics([{ status: "APPLIED", applied: true }, { status: "TECHNICAL_INTERVIEW", applied: true }, { status: "OFFER", applied: true }, { status: "READY", applied: false }]);
    expect(metrics).toMatchObject({ submitted: 3, responses: 2, interviews: 2, offers: 1, responseRate: 67, offerRate: 33 });
  });
});
