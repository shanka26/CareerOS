export const productDomains = [
  "career",
  "documents",
  "jobs",
  "applications",
  "assistant",
  "analytics",
  "settings",
] as const;

export type ProductDomain = (typeof productDomains)[number];
