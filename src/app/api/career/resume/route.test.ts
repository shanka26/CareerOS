import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analyze: vi.fn(),
  extract: vi.fn(),
  getSession: vi.fn(),
  store: vi.fn(),
  transcribe: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/domains/settings/auth/session", () => ({ getSession: mocks.getSession }));
vi.mock("@/domains/career/resume/analysis", () => ({ analyzeResumeText: mocks.analyze }));
vi.mock("@/domains/career/resume/extract-text", () => ({ extractResumeText: mocks.extract }));
vi.mock("@/domains/career/resume/storage", () => ({ storeResume: mocks.store }));
vi.mock("@/domains/career/resume/transcribe-file", () => ({ transcribeResumeFile: mocks.transcribe }));
vi.mock("@/shared/db/prisma", () => ({ prisma: { $transaction: mocks.transaction } }));

import { POST } from "./route";

describe("resume upload route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user-123" } });
    mocks.transcribe.mockResolvedValue("Grace Hopper - Computer Scientist");
    mocks.extract.mockImplementation((bytes, kind, fallback) => fallback(bytes, kind));
    mocks.analyze.mockResolvedValue({ analysis: { profile: {} }, provenance: { provider: "openai", model: "test-model" } });
    mocks.store.mockResolvedValue({ location: "private://resume.pdf", provider: "test", remove: vi.fn() });
    mocks.transaction.mockImplementation(async (callback) => callback({
      document: { create: vi.fn().mockResolvedValue({ id: "document-123" }) },
      memorySuggestion: { create: vi.fn().mockResolvedValue({ id: "suggestion-123" }) },
    }));
  });

  it("recognizes and analyzes a scanned PDF before saving the original", async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
    const form = new FormData();
    const file = new File([bytes], "scan.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", { value: async () => Uint8Array.from(bytes).buffer });
    form.set("resume", file);

    const response = await POST({ formData: async () => form } as Request);
    const payload = await response.json();

    expect(response.status, JSON.stringify(payload)).toBe(201);
    expect(payload).toEqual({ documentId: "document-123", suggestionId: "suggestion-123" });
    expect(mocks.transcribe).toHaveBeenCalledWith("user-123", expect.any(Uint8Array), "pdf");
    expect(mocks.analyze).toHaveBeenCalledWith("user-123", "Grace Hopper - Computer Scientist");
    expect(mocks.store).toHaveBeenCalledWith("user-123", expect.any(Uint8Array), "pdf");
  });
});
