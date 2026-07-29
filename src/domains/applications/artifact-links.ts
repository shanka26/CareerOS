import { z } from "zod";

const submittedStatuses = new Set(["APPLIED", "RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "FINAL_INTERVIEW", "OFFER", "REJECTED", "ARCHIVED"]);

export const applicationArtifactLinksSchema = z
  .object({
    status: z.string(),
    resumeDocumentId: z.string().min(1).nullable(),
    resumeVersionId: z.string().min(1).nullable(),
    coverLetterDocumentId: z.string().min(1).nullable(),
    coverLetterVersionId: z.string().min(1).nullable(),
  })
  .superRefine((value, context) => {
    const resumeComplete = Boolean(value.resumeDocumentId) === Boolean(value.resumeVersionId);
    const coverComplete = Boolean(value.coverLetterDocumentId) === Boolean(value.coverLetterVersionId);
    if (!resumeComplete) context.addIssue({ code: "custom", path: ["resumeVersionId"], message: "A resume document and exact version must be linked together." });
    if (!coverComplete) context.addIssue({ code: "custom", path: ["coverLetterVersionId"], message: "A cover letter document and exact version must be linked together." });
    if (submittedStatuses.has(value.status) && (!value.resumeVersionId || !value.coverLetterVersionId)) {
      context.addIssue({ code: "custom", path: ["status"], message: "Submitted applications must preserve exact resume and cover letter versions." });
    }
  });
