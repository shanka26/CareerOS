import { afterEach, describe, expect, it, vi } from "vitest";
import { assertPublicJobUrl, fetchPublicJobText } from "./safe-fetch";
afterEach(() => vi.restoreAllMocks());

describe("public job URL policy", () => {
  it.each(["https://127.0.0.1/job", "https://10.0.0.1/job", "https://169.254.1.1/job", "https://192.168.1.1/job", "https://[::1]/job"]) ("rejects private destination %s", async (value) => {
    await expect(assertPublicJobUrl(value)).rejects.toThrow(/Private|local/);
  });

  it("rejects insecure, credentialed, and custom-port URLs", async () => {
    await expect(assertPublicJobUrl("http://93.184.216.34/job")).rejects.toThrow(/public HTTPS/);
    await expect(assertPublicJobUrl("https://user:pass@93.184.216.34/job")).rejects.toThrow(/public HTTPS/);
    await expect(assertPublicJobUrl("https://93.184.216.34:8443/job")).rejects.toThrow(/public HTTPS/);
  });

  it("accepts a syntactically public HTTPS address", async () => {
    await expect(assertPublicJobUrl("https://93.184.216.34/job")).resolves.toMatchObject({ protocol: "https:" });
  });

  it("rejects an oversized response before buffering the body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ignored", { headers: { "content-type": "text/html", "content-length": "1000001" } }));
    await expect(fetchPublicJobText("https://93.184.216.34/job")).rejects.toThrow(/too large/);
  });
});
