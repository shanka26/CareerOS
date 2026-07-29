import { describe, expect, it } from "vitest";
import { buildUserEditedVersion } from "./version-provenance";

describe("user-edited document provenance", () => {
  it("inherits the exact generation snapshot and model metadata", () => {
    const result = buildUserEditedVersion(
      { version: 2, knowledgeSnapshotId: "snapshot", aiProvider: "openai", aiModel: "model", promptVersion: "resume/v1" },
      "edited",
      "Tightened wording",
    );
    expect(result).toMatchObject({ version: 3, knowledgeSnapshotId: "snapshot", aiProvider: "openai", aiModel: "model", promptVersion: "resume/v1" });
    expect(result.changeExplanation).toEqual({ summary: "Tightened wording", source: "user-edit", basedOnVersion: 2 });
  });
});
