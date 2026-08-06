import type { JobSearchSuggestions } from "./types";

export interface SearchSuggestionProfile {
  targetRole?: string | null | undefined;
  headline?: string | null | undefined;
  skills: string[];
  experienceTitles: string[];
}

export function buildJobSearchSuggestions(profile: SearchSuggestionProfile): JobSearchSuggestions {
  const keywords = [...new Set([
    profile.targetRole?.trim(),
    ...profile.experienceTitles.map((title) => title.trim()),
    ...profile.skills.map((skill) => skill.trim()),
  ].filter((value): value is string => Boolean(value)))].slice(0, 10);

  const primaryRole = profile.targetRole?.trim() || profile.experienceTitles[0]?.trim() || profile.headline?.trim();
  const prompts = [
    primaryRole,
    primaryRole && profile.skills[0] ? `${primaryRole} ${profile.skills[0]}` : null,
    primaryRole && profile.skills[1] ? `${primaryRole} ${profile.skills[1]}` : null,
    profile.skills.length >= 2 ? `${profile.skills[0]} ${profile.skills[1]}` : null,
  ].filter((value): value is string => Boolean(value));

  return { keywords, prompts: [...new Set(prompts)].slice(0, 6) };
}
