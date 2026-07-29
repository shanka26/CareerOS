import { describe, expect, it } from "vitest";

import { belongsToUser, scopeOwnedWhere } from "./ownership";

describe("tenant query scopes", () => {
  it("always includes the authenticated owner", () => {
    expect(scopeOwnedWhere("user-a", { id: "doc-a" })).toEqual({ AND: [{ id: "doc-a" }, { ownerId: "user-a" }] });
    expect(scopeOwnedWhere("user-a")).toEqual({ ownerId: "user-a" });
  });

  it("supports models whose ownership key is userId", () => {
    expect(belongsToUser("user-a")).toEqual({ userId: "user-a" });
  });
});
