import { z } from "zod";

const evidenceSchema = z.array(z.string().trim().min(1).max(500)).max(8);
const nullableText = (max: number) => z.object({ value: z.string().trim().min(1).max(max).nullable(), evidence: evidenceSchema });
const textList = (itemMax: number, countMax: number) => z.object({ values: z.array(z.string().trim().min(1).max(itemMax)).max(countMax), evidence: evidenceSchema });
const dateSchema = z.string().regex(/^\d{4}(?:-\d{2})?(?:-\d{2})?$/).nullable();
const achievementSchema = z.object({ description: z.string().trim().min(1).max(2_000), metric: z.string().trim().min(1).max(160).nullable(), quantified: z.boolean(), evidence: evidenceSchema.min(1) });

export const resumeAnalysisSchema = z.object({
  profile: z.object({
    headline: nullableText(160),
    summary: nullableText(2_000),
    targetRole: nullableText(120),
    preferredLocations: textList(100, 20),
    remotePreference: z.object({ value: z.enum(["ONSITE", "HYBRID", "REMOTE", "FLEXIBLE"]).nullable(), evidence: evidenceSchema }),
    careerGoals: textList(300, 20),
    salaryExpectation: nullableText(300),
  }),
  experiences: z.array(z.object({
    company: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(120),
    startDate: dateSchema,
    endDate: dateSchema,
    current: z.boolean().nullable(),
    description: z.string().trim().min(1).max(5_000),
    achievements: z.array(achievementSchema).max(30),
    evidence: evidenceSchema.min(1),
  })).max(30),
  skills: z.array(z.object({ name: z.string().trim().min(1).max(80), category: z.string().trim().min(1).max(80), proficiency: z.string().trim().min(1).max(80).nullable(), evidence: evidenceSchema.min(1) })).max(150),
  projects: z.array(z.object({ name: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(5_000), impact: z.string().trim().min(1).max(2_000).nullable(), technologies: z.array(z.string().trim().min(1).max(80)).max(50), evidence: evidenceSchema.min(1) })).max(30),
  education: z.array(z.object({ school: z.string().trim().min(1).max(160), degree: z.string().trim().min(1).max(160).nullable(), field: z.string().trim().min(1).max(160).nullable(), graduationDate: dateSchema, evidence: evidenceSchema.min(1) })).max(20),
  certifications: z.array(z.object({ name: z.string().trim().min(1).max(160), issuer: z.string().trim().min(1).max(160).nullable(), issueDate: dateSchema, expirationDate: dateSchema, evidence: evidenceSchema.min(1) })).max(30),
  additionalFacts: z.array(z.object({ label: z.string().trim().min(1).max(120), value: z.string().trim().min(1).max(1_000), evidence: evidenceSchema.min(1) })).max(50),
  report: z.object({
    executiveSummary: z.object({ text: z.string().trim().min(1).max(2_000), evidence: evidenceSchema.min(1) }),
    strengths: z.array(z.object({ text: z.string().trim().min(1).max(500), evidence: evidenceSchema.min(1) })).max(20),
    improvementOpportunities: z.array(z.object({ text: z.string().trim().min(1).max(500), evidence: evidenceSchema.min(1) })).max(20),
    missingFields: z.array(z.string().trim().min(1).max(200)).max(50),
    followUpQuestions: z.array(z.string().trim().min(1).max(500)).max(30),
  }),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
export const storedResumeAnalysisSchema = resumeAnalysisSchema.extend({ rawText: z.string().min(1), provenance: z.object({ provider: z.string().min(1), model: z.string().min(1) }) });
export type StoredResumeAnalysis = z.infer<typeof storedResumeAnalysisSchema>;
