import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { delMock, localStoreMock, putMock } = vi.hoisted(() => ({
  delMock: vi.fn(),
  localStoreMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({ del: delMock, put: putMock }));
vi.mock("./local-storage", () => ({ storeResumeLocally: localStoreMock }));

import { storeResume } from "./storage";

describe("resume storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-token");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("stores production resumes privately under a pseudonymous randomized key", async () => {
    vi.stubEnv("NODE_ENV", "production");
    putMock.mockResolvedValue({ url: "https://store.private.blob.vercel-storage.com/resumes/file.pdf" });
    delMock.mockResolvedValue(undefined);
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    const stored = await storeResume("user-123", bytes, "pdf");

    expect(putMock).toHaveBeenCalledWith(
      expect.stringMatching(/^resumes\/[a-f0-9]{64}\/[0-9a-f-]{36}\.pdf$/),
      Buffer.from(bytes),
      expect.objectContaining({ access: "private", addRandomSuffix: false, allowOverwrite: false, contentType: "application/pdf" }),
    );
    expect(putMock.mock.calls[0]?.[0]).not.toContain("user-123");
    expect(stored).toMatchObject({ location: "https://store.private.blob.vercel-storage.com/resumes/file.pdf", provider: "vercel-blob" });

    await stored.remove();
    expect(delMock).toHaveBeenCalledWith(stored.location);
  });

  it("keeps local storage for non-production development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    localStoreMock.mockResolvedValue("C:\\workspace\\.data\\uploads\\resume.docx");

    const stored = await storeResume("user-123", new Uint8Array([0x50, 0x4b]), "docx");

    expect(stored).toMatchObject({ location: "C:\\workspace\\.data\\uploads\\resume.docx", provider: "local" });
    expect(putMock).not.toHaveBeenCalled();
  });

  it("uses the correct content type for legacy Word documents", async () => {
    vi.stubEnv("NODE_ENV", "production");
    putMock.mockResolvedValue({ url: "https://store.private.blob.vercel-storage.com/resumes/file.doc" });

    await storeResume("user-123", new Uint8Array([0xd0, 0xcf]), "doc");

    expect(putMock).toHaveBeenCalledWith(
      expect.stringMatching(/\.doc$/),
      expect.any(Buffer),
      expect.objectContaining({ contentType: "application/msword" }),
    );
  });
});
