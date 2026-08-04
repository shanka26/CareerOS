import { describe, expect, it } from "vitest";

import { getAuthErrorMessage, getUnexpectedAuthErrorMessage } from "./error-message";

describe("authentication error messages", () => {
  it("keeps sign-in failures private while giving useful guidance", () => {
    expect(getAuthErrorMessage("sign-in", { code: "INVALID_EMAIL_OR_PASSWORD", status: 401 })).toBe(
      "The email or password is incorrect. Check both fields and try again.",
    );
    expect(getAuthErrorMessage("sign-in", { code: "USER_NOT_FOUND", status: 404 })).toBe(
      "The email or password is incorrect. Check both fields and try again.",
    );
  });

  it("explains how to recover from an existing account", () => {
    expect(getAuthErrorMessage("sign-up", { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", status: 422 })).toBe(
      "An account already exists for this email. Sign in instead or use a different email.",
    );
  });

  it("identifies rate limits and temporary service failures", () => {
    expect(getAuthErrorMessage("sign-in", { status: 429 })).toContain("Wait one minute");
    expect(getAuthErrorMessage("sign-up", { status: 503 })).toContain("No account was created");
  });

  it("distinguishes connection failures from unknown failures", () => {
    expect(getUnexpectedAuthErrorMessage("sign-in", new TypeError("Failed to fetch"))).toContain("Check your connection");
    expect(getUnexpectedAuthErrorMessage("google", new Error("Unknown"))).toContain("Google sign-in could not start");
  });
});
