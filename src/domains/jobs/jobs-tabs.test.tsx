import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getJobsTab, JobsTabs } from "./jobs-tabs";

describe("JobsTabs", () => {
  it("shows job search by default while preserving the personal jobs URL", () => {
    expect(getJobsTab(undefined)).toBe("find-job");
    expect(getJobsTab("my-jobs")).toBe("my-jobs");
    expect(getJobsTab("unknown")).toBe("find-job");
  });

  it("links to distinct personal and discovery views and exposes the active tab", () => {
    render(<JobsTabs activeTab="find-job" />);

    expect(screen.getByRole("link", { name: "My Jobs" })).toHaveAttribute("href", "/dashboard/jobs?tab=my-jobs");
    expect(screen.getByRole("link", { name: "My Jobs" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Search Jobs" })).toHaveAttribute("href", "/dashboard/jobs");
    expect(screen.getByRole("link", { name: "Search Jobs" })).toHaveAttribute("aria-current", "page");
  });
});
