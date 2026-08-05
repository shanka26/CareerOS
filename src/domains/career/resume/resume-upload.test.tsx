import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResumeUpload } from "./resume-upload";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("ResumeUpload", () => {
  beforeEach(() => {
    refresh.mockReset();
    vi.restoreAllMocks();
  });

  it("shows an accessible processing indicator while resume analysis is running", async () => {
    let finishRequest: (response: Response) => void = () => undefined;
    const response = new Promise<Response>((resolve) => {
      finishRequest = resolve;
    });
    vi.spyOn(globalThis, "fetch").mockReturnValue(response);
    render(<ResumeUpload />);

    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    const resume = new File(["%PDF-1.7"], "resume.pdf", { type: "application/pdf" });
    fireEvent.change(input as HTMLInputElement, { target: { files: [resume] } });
    fireEvent.click(screen.getByRole("button", { name: "Analyze my resume with AI" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Processing resume.pdf");
    expect(screen.getByText(/reading visible text and scanned images/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Processing resume..." })).toBeDisabled();
    expect(input).toBeDisabled();
    expect(input?.closest("form")).toHaveAttribute("aria-busy", "true");

    finishRequest(new Response(JSON.stringify({ suggestionId: "suggestion" }), { status: 201 }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });
});
