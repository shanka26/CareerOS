import { describe, expect, it } from "vitest";

import { productDomains } from "./index";

describe("product domain registry", () => {
  it("keeps the charter domains explicit and unique", () => {
    expect(new Set(productDomains).size).toBe(productDomains.length);
    expect(productDomains).toEqual(
      expect.arrayContaining(["career", "documents", "jobs", "applications", "assistant", "analytics", "settings"]),
    );
  });
});
