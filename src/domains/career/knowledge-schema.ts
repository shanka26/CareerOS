import { z } from "zod";

const optionalDate = z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.date().optional());
const id = z.string().min(1).optional();

export const careerKnowledgeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("skill"), id, name: z.string().trim().min(1).max(80), category: z.string().trim().min(1).max(80).default("User"), proficiency: z.string().trim().max(80).optional() }),
  z.object({ kind: z.literal("achievement"), id, experienceId: z.string().min(1), description: z.string().trim().min(1).max(2_000), metric: z.string().trim().max(160).optional(), quantified: z.boolean().default(false) }),
  z.object({ kind: z.literal("project"), id, name: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(5_000), impact: z.string().trim().max(2_000).optional(), technologies: z.array(z.string().trim().min(1).max(80)).max(50).default([]) }),
  z.object({ kind: z.literal("education"), id, school: z.string().trim().min(1).max(160), degree: z.string().trim().max(160).optional(), field: z.string().trim().max(160).optional(), graduationDate: optionalDate }),
  z.object({ kind: z.literal("certification"), id, name: z.string().trim().min(1).max(160), issuer: z.string().trim().min(1).max(160), issueDate: optionalDate, expirationDate: optionalDate }),
]);
