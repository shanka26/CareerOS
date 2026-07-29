import type { VerifiedCareerFacts } from "./resume-composer";

export function composeVerifiedCoverLetter(
  facts: VerifiedCareerFacts,
  job: { title: string; company: string },
) {
  const evidence = facts.experiences[0];
  const body = [
    `Dear ${job.company} hiring team,`,
    `I am writing to apply for the ${job.title} role. ${facts.summary ?? facts.headline ?? "My verified career profile reflects experience relevant to this opportunity."}`,
    evidence
      ? `At ${evidence.company}, as ${evidence.title}, ${evidence.description}`
      : "",
    `I would welcome the opportunity to discuss how this verified experience can support ${job.company}.`,
    `Sincerely,\n${facts.name}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    markdown: body,
    explanations: [
      {
        what: "Connected verified experience to the role",
        why: `The letter names ${job.company} and ${job.title} without adding unsupported company claims.`,
        factIds: evidence ? [evidence.id] : [],
      },
    ],
  };
}
