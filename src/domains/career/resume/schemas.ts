import { z } from "zod";

const optionalText = z.string().trim().max(2_000).optional();
const nullableDateText = z.preprocess(
  (value) => value === "" || value == null ? null : value,
  z.string().regex(/^\d{4}(?:-\d{2})?(?:-\d{2})?$/).nullable(),
);

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

export const approveResumeAnalysisSchema = z.object({
  suggestionId: z.string().min(1),
  headline: z.string().trim().max(160).nullable(),
  summary: z.string().trim().max(2_000).nullable(),
  targetRole: z.string().trim().max(120).nullable(),
  preferredLocations: z.array(z.string().trim().min(1).max(100)).max(20),
  remotePreference: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).nullable(),
  careerGoals: z.array(z.string().trim().min(1).max(300)).max(20),
  salaryExpectation: z.string().trim().max(300).nullable(),
  experiences: z.array(z.object({
    company: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(120),
    startDate: nullableDateText,
    endDate: nullableDateText,
    current: z.boolean().nullable(),
    description: z.string().trim().min(1).max(5_000),
    achievements: z.array(z.object({
      description: z.string().trim().min(1).max(2_000),
      metric: z.string().trim().max(160).nullable(),
      quantified: z.boolean(),
    })).max(30),
  })).max(30),
  skills: z.array(z.object({
    name: z.string().trim().min(1).max(80),
    category: z.string().trim().min(1).max(80),
    proficiency: z.string().trim().max(80).nullable(),
  })).max(150),
  projects: z.array(z.object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(5_000),
    impact: z.string().trim().max(2_000).nullable(),
    technologies: z.array(z.string().trim().min(1).max(80)).max(50),
  })).max(30),
  education: z.array(z.object({
    school: z.string().trim().min(1).max(160),
    degree: z.string().trim().max(160).nullable(),
    field: z.string().trim().max(160).nullable(),
    graduationDate: nullableDateText,
  })).max(20),
  certifications: z.array(z.object({
    name: z.string().trim().min(1).max(160),
    issuer: z.string().trim().min(1).max(160),
    issueDate: nullableDateText,
    expirationDate: nullableDateText,
  })).max(30),
});

export type ResumeAnalysisApproval = z.infer<typeof approveResumeAnalysisSchema>;
