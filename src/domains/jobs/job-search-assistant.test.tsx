import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { JobSearchAssistant } from "./job-search-assistant";

afterEach(() => vi.restoreAllMocks());

describe("JobSearchAssistant", () => {
  it("chats, presents an explainable search, and applies it only after approval", async () => {
    const onApply = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      reply: "A senior platform search fits your stated direction. Do you want to limit it to a specific industry?",
      search: { query: "Senior Platform Engineer TypeScript", location: "Chicago", remote: "remote" },
      readyToSearch: true,
      rationale: "This keeps the role recognizable and adds one differentiating verified skill.",
    }), { status: 200 }));
    render(<JobSearchAssistant currentSearch={{ query: "Platform Engineer", location: "", remote: "any" }} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText("Message the job search coach"), { target: { value: "I want a senior remote role in Chicago." } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Senior Platform Engineer TypeScript")).toBeVisible();
    expect(onApply).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Use this search" }));
    expect(onApply).toHaveBeenCalledWith({ query: "Senior Platform Engineer TypeScript", location: "Chicago", remote: "remote" });
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/jobs/search-assistant", expect.objectContaining({ method: "POST" })));
  });
});
