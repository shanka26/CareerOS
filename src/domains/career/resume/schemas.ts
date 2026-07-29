import { z } from "zod";

const optionalText = z.string().trim().max(2_000).optional();

export const approveResumeDraftSchema = z.object({
  suggestionId: z.string().min(1),
  headline: z.string().trim().max(160).optional(),
  summary: optionalText,
  targetRole: z.string().trim().max(120).optional(),
  preferredLocations: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  remotePreference: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).nullable().default(null),
  careerGoals: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  salaryExpectation: z.string().trim().max(300).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).max(100).default([]),
});

export const updateCareerProfileSchema = approveResumeDraftSchema.omit({ suggestionId: true, skills: true });
