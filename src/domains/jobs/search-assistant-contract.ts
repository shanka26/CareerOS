import { z } from "zod";

export const jobSearchAssistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
});

export const jobSearchAssistantRequestSchema = z.object({
  messages: z.array(jobSearchAssistantMessageSchema).min(1).max(12),
  currentSearch: z.object({
    query: z.string().trim().max(100),
    location: z.string().trim().max(100),
    remote: z.enum(["any", "remote", "onsite"]),
  }),
});

export const jobSearchAssistantResponseSchema = z.object({
  reply: z.string().trim().min(1).max(1_200),
  search: z.object({
    query: z.string().trim().min(2).max(100),
    location: z.string().trim().max(100),
    remote: z.enum(["any", "remote", "onsite"]),
  }),
  readyToSearch: z.boolean(),
  rationale: z.string().trim().min(1).max(500),
});

export type JobSearchAssistantMessage = z.infer<typeof jobSearchAssistantMessageSchema>;
export type JobSearchAssistantResponse = z.infer<typeof jobSearchAssistantResponseSchema>;
