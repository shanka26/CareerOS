import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobImportForm } from "./job-import-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("JobImportForm", () => {
  beforeEach(() => {
    push.mockReset();
    vi.restoreAllMocks();
  });

  it("recovers from a network failure and lets the user retry", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    render(<JobImportForm />);

    fireEvent.change(screen.getByLabelText("Paste job description"), {
      target: { value: "Senior software engineer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze and save job" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The job could not be analyzed. Check your connection and try again.",
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Analyze and save job" })).toBeEnabled());
  });
});
