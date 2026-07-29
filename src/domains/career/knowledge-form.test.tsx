import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KnowledgeForm } from "./knowledge-form";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("KnowledgeForm", () => {
  beforeEach(() => { refresh.mockReset(); vi.restoreAllMocks(); });

  it("submits a user-authored skill as verified career knowledge", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "skill" }), { status: 201 }));
    render(<KnowledgeForm kind="skill" />);
    fireEvent.click(screen.getByRole("button", { name: /add skill/i }));
    fireEvent.change(screen.getByLabelText("Skill"), { target: { value: "TypeScript" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Language" } });
    fireEvent.click(screen.getByRole("button", { name: /save verified fact/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(options.body))).toMatchObject({ kind: "skill", name: "TypeScript", category: "Language" });
    expect(refresh).toHaveBeenCalled();
  });
});
