import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DocumentEditor } from "./document-editor";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("DocumentEditor", () => {
  beforeEach(() => {
    refresh.mockReset();
    vi.restoreAllMocks();
  });

  it("recovers from a malformed server response and lets the user retry", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Service unavailable", { status: 503 }));
    render(<DocumentEditor id="document" markdown="# Resume" />);

    fireEvent.click(screen.getByRole("button", { name: "Save new version" }));

    expect(await screen.findByRole("status")).toHaveTextContent("The document version could not be saved.");
    await waitFor(() => expect(screen.getByRole("button", { name: "Save new version" })).toBeEnabled());
    expect(refresh).not.toHaveBeenCalled();
  });
});
