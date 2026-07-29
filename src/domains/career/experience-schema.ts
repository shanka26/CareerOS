import { z } from "zod";

const optionalDate = z.preprocess((value) => value === "" || value == null ? undefined : value, z.coerce.date().optional());

export const createExperienceSchema = z.object({
  company: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(120),
  startDate: optionalDate,
  endDate: optionalDate,
  current: z.boolean().default(false),
  description: z.string().trim().min(1).max(5_000),
});
