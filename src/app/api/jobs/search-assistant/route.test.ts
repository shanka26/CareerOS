import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getProvider: vi.fn(),
  runCapability: vi.fn(),
  findProfile: vi.fn(),
}));

vi.mock("@/domains/settings/auth/session", () => ({ getSession: mocks.getSession }));
vi.mock("@/domains/assistant/runtime", () => ({
  createSafetyIdentifier: () => "safe-user",
  getConfiguredAIProvider: mocks.getProvider,
}));
vi.mock("@/domains/assistant/orchestrator", () => ({ runCapability: mocks.runCapability }));
vi.mock("@/shared/db/prisma", () => ({ prisma: { careerProfile: { findUnique: mocks.findProfile } } }));

import { POST } from "./route";

describe("job search assistant route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { id: "user-123" } });
    mocks.getProvider.mockReturnValue({ generate: vi.fn() });
    mocks.findProfile.mockResolvedValue({
      headline: "Platform engineer", targetRole: "Staff Platform Engineer", preferredLocations: ["Chicago"],
      remotePreference: "REMOTE", careerGoals: ["Lead infrastructure work"],
      careerSkills: [{ proficiency: "advanced", skill: { name: "TypeScript" } }],
      experiences: [{ title: "Senior Software Engineer" }],
    });
    mocks.runCapability.mockResolvedValue({ data: {
      reply: "This is ready to search.",
      search: { query: "Staff Platform Engineer TypeScript", location: "Chicago", remote: "remote" },
      readyToSearch: true,
      rationale: "It combines the target role with a verified skill.",
    } });
  });

  it("grounds the conversation in the authenticated user's verified profile", async () => {
    const request = new Request("http://localhost/api/jobs/search-assistant", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Help me find a remote platform role." }],
        currentSearch: { query: "Platform Engineer", location: "", remote: "any" },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ readyToSearch: true, search: { remote: "remote" } });
    expect(mocks.runCapability).toHaveBeenCalledWith("user-123", expect.anything(), expect.objectContaining({
      capability: "generate-job-search",
      input: expect.objectContaining({ verifiedProfile: expect.objectContaining({ skills: [{ name: "TypeScript", proficiency: "advanced" }] }) }),
    }));
  });

  it("rejects unauthenticated chat requests", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost/api/jobs/search-assistant", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(mocks.runCapability).not.toHaveBeenCalled();
  });
});
