const sectionHeading = /^(skills|technical skills|core competencies|technologies|experience|work experience|professional experience|education|certifications?)[:\s]*$/i;

export interface ResumeDraft {
  headline: string | null;
  skills: string[];
  rawText: string;
  questions: string[];
}

export const resumeDraftSchema = z.object({
  headline: z.string().nullable(),
  skills: z.array(z.string()),
  rawText: z.string(),
  questions: z.array(z.string()),
});

function likelyContactLine(line: string) {
  return /@|https?:|linkedin|github|\+?\d[\d\s().-]{7,}/i.test(line);
}

export function buildConservativeResumeDraft(rawText: string): ResumeDraft {
  const lines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);
  const headline = lines.slice(0, 8).find((line, index) => index > 0 && !likelyContactLine(line) && !sectionHeading.test(line) && line.length <= 100) ?? null;
  const skills: string[] = [];
  let inSkills = false;
  for (const line of lines) {
    if (sectionHeading.test(line)) {
      inSkills = /skills|competencies|technologies/i.test(line);
      continue;
    }
    if (!inSkills) continue;
    for (const candidate of line.split(/[,|•·]/).map((item) => item.trim())) {
      if (candidate.length >= 2 && candidate.length <= 50 && !skills.some((skill) => skill.toLowerCase() === candidate.toLowerCase())) skills.push(candidate);
    }
    if (skills.length >= 30) break;
  }

  return {
    headline,
    skills,
    rawText,
    questions: [
      "Which role are you targeting next?",
      "Which achievements can you support with specific outcomes or metrics?",
      "Which locations and work arrangements do you prefer?",
    ],
  };
}
import { z } from "zod";
