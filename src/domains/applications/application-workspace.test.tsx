import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationWorkspace } from "./application-workspace";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("ApplicationWorkspace", () => {
  beforeEach(() => { refresh.mockReset(); vi.restoreAllMocks(); });

  it("creates an application with exact document and version identifiers", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ applicationId: "application" }), { status: 201 }));
    render(<ApplicationWorkspace jobs={[{ id: "job", label: "Acme - Engineer" }]} resumes={[{ id: "resume-version", label: "Resume v1", documentId: "resume-document", versionId: "resume-version" }]} coverLetters={[{ id: "cover-version", label: "Cover v1", documentId: "cover-document", versionId: "cover-version" }]} applications={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Create as Ready" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(options.body))).toEqual({ jobId: "job", resumeDocumentId: "resume-document", resumeVersionId: "resume-version", coverLetterDocumentId: "cover-document", coverLetterVersionId: "cover-version" });
  });
});
