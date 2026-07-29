export const applicationStatuses = [
  "SAVED",
  "TAILORING",
  "READY",
  "APPLIED",
  "RECRUITER_SCREEN",
  "TECHNICAL_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
] as const;

export type ApplicationStatusValue = (typeof applicationStatuses)[number];

const transitions: Record<ApplicationStatusValue, ApplicationStatusValue[]> = {
  SAVED: ["TAILORING", "ARCHIVED"],
  TAILORING: ["SAVED", "READY", "ARCHIVED"],
  READY: ["TAILORING", "APPLIED", "ARCHIVED"],
  APPLIED: ["RECRUITER_SCREEN", "REJECTED", "ARCHIVED"],
  RECRUITER_SCREEN: ["TECHNICAL_INTERVIEW", "REJECTED", "ARCHIVED"],
  TECHNICAL_INTERVIEW: ["FINAL_INTERVIEW", "REJECTED", "ARCHIVED"],
  FINAL_INTERVIEW: ["OFFER", "REJECTED", "ARCHIVED"],
  OFFER: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionApplication(
  from: ApplicationStatusValue,
  to: ApplicationStatusValue,
) {
  return from === to || transitions[from].includes(to);
}

export function applicationStatusLabel(status: ApplicationStatusValue) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}
