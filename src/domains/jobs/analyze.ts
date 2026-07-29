function labeledValue(lines: string[], label: RegExp) {
  const line = lines.find((candidate) => label.test(candidate));
  return line?.replace(label, "").trim() || null;
}

export function analyzeJobText(text: string, verifiedSkills: string[]) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = labeledValue(lines, /^(job\s+)?title\s*:\s*/i) ?? lines[0]?.slice(0, 120) ?? "Imported role";
  const company = labeledValue(lines, /^company\s*:\s*/i) ?? lines[1]?.slice(0, 120) ?? "Unknown company";
  const location = labeledValue(lines, /^location\s*:\s*/i);
  const employmentType = labeledValue(lines, /^(employment\s+type|job\s+type)\s*:\s*/i)
    ?? lines.find((line) => /^(full[- ]time|part[- ]time|contract|internship|temporary)$/i.test(line))
    ?? null;
  const salaryText = labeledValue(lines, /^(salary|compensation|pay\s+range)\s*:\s*/i)
    ?? lines.find((line) => /\$\s?\d[\d,.]*(?:\s*[-\u2013\u2014]\s*\$?\s?\d[\d,.]*)?/.test(line))
    ?? null;
  const requirements = lines.filter((line) => /required|requirements|qualifications|experience with|proficient|years/i.test(line)).slice(0, 30);
  const lower = text.toLowerCase();
  const matchedSkills = verifiedSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  const score = verifiedSkills.length ? Math.round((matchedSkills.length / verifiedSkills.length) * 100) : 0;
  return {
    title: title.slice(0, 120),
    company: company.slice(0, 120),
    location,
    employmentType,
    salary: salaryText ? { sourceText: salaryText } : null,
    requirements,
    matchedSkills,
    score,
    explanation: verifiedSkills.length ? `${matchedSkills.length} of ${verifiedSkills.length} verified profile skills appear in the job text.` : "Add verified skills to calculate a profile match.",
  };
}
