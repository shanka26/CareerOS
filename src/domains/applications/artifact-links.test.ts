import { describe, expect, it } from "vitest";

import { applicationArtifactLinksSchema } from "./artifact-links";

describe("application artifact links", () => {
  it("allows a saved application before documents are ready", () => {
    expect(applicationArtifactLinksSchema.safeParse({ status: "SAVED", resumeDocumentId: null, resumeVersionId: null, coverLetterDocumentId: null, coverLetterVersionId: null }).success).toBe(true);
  });

  it("requires exact paired versions for submitted applications", () => {
    expect(applicationArtifactLinksSchema.safeParse({ status: "APPLIED", resumeDocumentId: "resume", resumeVersionId: null, coverLetterDocumentId: "cover", coverLetterVersionId: "cover-v1" }).success).toBe(false);
    expect(applicationArtifactLinksSchema.safeParse({ status: "APPLIED", resumeDocumentId: "resume", resumeVersionId: "resume-v1", coverLetterDocumentId: "cover", coverLetterVersionId: "cover-v1" }).success).toBe(true);
  });
});
