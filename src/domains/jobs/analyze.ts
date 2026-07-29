export function analyzeJobText(text: string, verifiedSkills: string[]) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 120) || "Imported role";
  const company = lines[1]?.slice(0, 120) || "Unknown company";
  const requirements = lines.filter((line) => /required|requirements|qualifications|experience with|proficient|years/i.test(line)).slice(0, 30);
  const lower = text.toLowerCase();
  const matchedSkills = verifiedSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  const score = verifiedSkills.length ? Math.round((matchedSkills.length / verifiedSkills.length) * 100) : 0;
  return { title, company, requirements, matchedSkills, score, explanation: verifiedSkills.length ? `${matchedSkills.length} of ${verifiedSkills.length} verified profile skills appear in the job text.` : "Add verified skills to calculate a profile match." };
}
