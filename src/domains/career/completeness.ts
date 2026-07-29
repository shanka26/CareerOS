interface CompletenessInput {
  headline?: string | null;
  summary?: string | null;
  targetRole?: string | null;
  preferredLocations?: string[];
  experienceCount: number;
  skillCount: number;
  educationCount: number;
}

export function calculateProfileCompleteness(input: CompletenessInput) {
  const checks = [Boolean(input.headline), Boolean(input.summary), Boolean(input.targetRole), Boolean(input.preferredLocations?.length), input.experienceCount > 0, input.skillCount > 0, input.educationCount > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
