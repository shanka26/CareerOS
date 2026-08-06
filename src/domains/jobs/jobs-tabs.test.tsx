import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobsTabs } from "./jobs-tabs";

describe("JobsTabs", () => {
  it("links to distinct personal and discovery views and exposes the active tab", () => {
    render(<JobsTabs activeTab="find-job" />);

    expect(screen.getByRole("link", { name: "My Jobs" })).toHaveAttribute("href", "/dashboard/jobs");
    expect(screen.getByRole("link", { name: "My Jobs" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Find Job" })).toHaveAttribute("href", "/dashboard/jobs?tab=find-job");
    expect(screen.getByRole("link", { name: "Find Job" })).toHaveAttribute("aria-current", "page");
  });
});
