import { afterEach, describe, expect, it, vi } from "vitest";

import { requestJson } from "./api-client";

afterEach(() => vi.restoreAllMocks());

describe("requestJson", () => {
  it("preserves an API error message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "The uploaded file is invalid." }), { status: 400 }),
    );

    await expect(requestJson("/api/test", {}, "Request failed.")).rejects.toThrow(
      "The uploaded file is invalid.",
    );
  });

  it("turns network failures into an actionable retry message", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(requestJson("/api/test", {}, "Request failed.")).rejects.toThrow(
      "Request failed. Check your connection and try again.",
    );
  });

  it("handles a non-JSON server response without exposing parser details", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Service unavailable", { status: 503 }),
    );

    await expect(requestJson("/api/test", {}, "Request failed.")).rejects.toThrow(
      "Request failed.",
    );
  });
});
