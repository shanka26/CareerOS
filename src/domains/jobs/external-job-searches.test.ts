import { describe, expect, it } from "vitest";

import { buildExternalJobSearches } from "./external-job-searches";

describe("buildExternalJobSearches", () => {
  it("carries the active query, location, and remote intent to common platforms", () => {
    const searches = buildExternalJobSearches({ query: "Platform Engineer", location: "Chicago", remote: "remote" });
    const linkedin = new URL(searches.find(({ id }) => id === "linkedin")!.url);
    const indeed = new URL(searches.find(({ id }) => id === "indeed")!.url);
    const google = new URL(searches.find(({ id }) => id === "google")!.url);

    expect(searches.map(({ label }) => label)).toEqual(["LinkedIn", "Indeed", "Glassdoor", "Google Jobs", "ZipRecruiter", "Dice"]);
    expect(linkedin.searchParams.get("keywords")).toBe("Platform Engineer remote");
    expect(linkedin.searchParams.get("location")).toBe("Chicago");
    expect(indeed.searchParams.get("q")).toBe("Platform Engineer remote");
    expect(indeed.searchParams.get("l")).toBe("Chicago");
    expect(google.searchParams.get("q")).toBe("Platform Engineer remote Chicago jobs");
  });
});
