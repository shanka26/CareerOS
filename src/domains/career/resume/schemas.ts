import { z } from "zod";

const optionalText = z.string().trim().max(2_000).optional();

const monthNumbers = new Map([
  ["jan", "01"], ["january", "01"], ["feb", "02"], ["february", "02"],
  ["mar", "03"], ["march", "03"], ["apr", "04"], ["april", "04"],
  ["may", "05"], ["jun", "06"], ["june", "06"], ["jul", "07"], ["july", "07"],
  ["aug", "08"], ["august", "08"], ["sep", "09"], ["sept", "09"], ["september", "09"],
  ["oct", "10"], ["october", "10"], ["nov", "11"], ["november", "11"],
  ["dec", "12"], ["december", "12"],
]);

export function normalizeResumeDate(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return value;

  const input = value.trim();
  if (!input) return null;
  if (/^\d{4}$/.test(input)) return input;

  const yearMonth = input.match(/^(\d{4})[-/](\d{1,2})$/);
  if (yearMonth) {
    const month = Number(yearMonth[2]);
    return month >= 1 && month <= 12 ? `${yearMonth[1]}-${String(month).padStart(2, "0")}` : input;
  }

  const monthYear = input.match(/^(\d{1,2})[/-](\d{4})$/);
  if (monthYear) {
    const month = Number(monthYear[1]);
    return month >= 1 && month <= 12 ? `${monthYear[2]}-${String(month).padStart(2, "0")}` : input;
  }

  const namedMonth = input.match(/^([a-z]+)\.?\s+(\d{4})$/i);
  if (namedMonth) {
    const month = monthNumbers.get(namedMonth[1]!.toLowerCase());
    if (month) return `${namedMonth[2]}-${month}`;
  }

  const fullDate = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fullDate) {
    const date = new Date(`${input}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime()) && date.toISOString().startsWith(input)) return input;
  }

  return input;
}

function isSupportedResumeDate(value: string) {
  if (/^\d{4}$/.test(value)) return true;
  const yearMonth = value.match(/^\d{4}-(\d{2})$/);
  if (yearMonth) return Number(yearMonth[1]) >= 1 && Number(yearMonth[1]) <= 12;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const nullableDateText = z.preprocess(
  normalizeResumeDate,
  z.string().refine(isSupportedResumeDate, "Enter a year or month and year, such as 2020 or Jul 2020.").nullable(),
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
