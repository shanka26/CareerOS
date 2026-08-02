export const aiCapabilities = ["analyze-resume", "analyze-job", "generate-resume", "generate-cover-letter", "research-company", "calculate-match", "update-career-knowledge", "generate-interview-prep"] as const;
export type AICapability = (typeof aiCapabilities)[number];

export const promptVersions: Record<AICapability, string> = Object.fromEntries(
  aiCapabilities.map((capability) => [
    capability,
    capability === "generate-resume" || capability === "generate-cover-letter"
      ? `${capability}/v2`
      : `${capability}/v1`,
  ]),
) as Record<AICapability, string>;
