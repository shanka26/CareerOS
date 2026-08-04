export interface VerifiedCareerFacts {
  name: string;
  headline?: string | null;
  summary?: string | null;
  targetRole?: string | null;
  preferredLocations?: string[];
  remotePreference?: string | null;
  careerGoals?: string[];
  skills: Array<{ id: string; name: string; proficiency?: string | null }>;
  experiences: Array<{ id: string; company: string; title: string; startDate?: string | null; endDate?: string | null; current?: boolean; description: string; achievements?: Array<{ id: string; description: string; metric?: string | null }> }>;
  projects?: Array<{ id: string; name: string; description: string; impact?: string | null; technologies: string[] }>;
  education?: Array<{ id: string; school: string; degree?: string | null; field?: string | null; graduationDate?: string | null }>;
  certifications?: Array<{ id: string; name: string; issuer: string; issueDate?: string | null; expirationDate?: string | null }>;
}

export function composeVerifiedResume(facts: VerifiedCareerFacts, job: { title: string; company: string; description: string }) {
  const lower = job.description.toLowerCase();
  const skills = [...facts.skills].sort((left, right) => Number(lower.includes(right.name.toLowerCase())) - Number(lower.includes(left.name.toLowerCase())));
  const relevance = (project: NonNullable<VerifiedCareerFacts["projects"]>[number]) => lower.includes(project.name.toLowerCase()) || project.technologies.some((technology) => lower.includes(technology.toLowerCase()));
  const projects = [...(facts.projects ?? [])].sort((left, right) => Number(relevance(right)) - Number(relevance(left)));
  const markdown = [
    `# ${facts.name}`, facts.headline ?? "", facts.summary ? `## Summary\n${facts.summary}` : "", "## Experience",
    ...facts.experiences.flatMap((experience) => [`### ${experience.title} - ${experience.company}`, experience.description, ...(experience.achievements ?? []).map((achievement) => `- ${achievement.description}${achievement.metric ? ` (${achievement.metric})` : ""}`)]),
    ...(projects.length ? ["## Projects", ...projects.flatMap((project) => [`### ${project.name}`, project.description, project.impact ?? ""])] : []),
    "## Skills", skills.map((skill) => skill.name).join(", "),
    ...((facts.education?.length ?? 0) ? ["## Education", ...facts.education!.map((education) => `${education.school}${education.degree ? ` - ${education.degree}` : ""}${education.field ? `, ${education.field}` : ""}`)] : []),
    ...((facts.certifications?.length ?? 0) ? ["## Certifications", ...facts.certifications!.map((certification) => `${certification.name} - ${certification.issuer}`)] : []),
  ].filter(Boolean).join("\n\n");
  const careerFactIds = [...facts.experiences.flatMap((experience) => [experience.id, ...(experience.achievements ?? []).map((achievement) => achievement.id)]), ...projects.map((project) => project.id), ...(facts.education ?? []).map((education) => education.id), ...(facts.certifications ?? []).map((certification) => certification.id)];
  return { markdown, explanations: [
    { what: "Reordered verified skills and projects", why: `Verified facts relevant to ${job.company} and ${job.title} appear first.`, factIds: [...skills.map((skill) => skill.id), ...projects.map((project) => project.id)] },
    { what: "Preserved verified career evidence", why: "Only user-verified career evidence was included.", factIds: careerFactIds },
  ] };
}
