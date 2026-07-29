import type { ApplicationStatusValue } from "@/domains/applications/status";

export interface AnalyticsApplication {
  status: ApplicationStatusValue;
  applied: boolean;
}

const responseStatuses = new Set<ApplicationStatusValue>(["RECRUITER_SCREEN", "TECHNICAL_INTERVIEW", "FINAL_INTERVIEW", "OFFER", "REJECTED"]);
const interviewStatuses = new Set<ApplicationStatusValue>(["TECHNICAL_INTERVIEW", "FINAL_INTERVIEW", "OFFER"]);

export function calculateCareerMetrics(applications: AnalyticsApplication[]) {
  const submitted = applications.filter((application) => application.applied).length;
  const responses = applications.filter((application) => responseStatuses.has(application.status)).length;
  const interviews = applications.filter((application) => interviewStatuses.has(application.status)).length;
  const offers = applications.filter((application) => application.status === "OFFER").length;
  const percentage = (value: number, total: number) => total === 0 ? 0 : Math.round((value / total) * 100);
  return { tracked: applications.length, submitted, responses, interviews, offers, responseRate: percentage(responses, submitted), interviewRate: percentage(interviews, submitted), offerRate: percentage(offers, submitted) };
}

export function calculateSuggestionMetrics(statuses: Array<"PENDING" | "ACCEPTED" | "REJECTED">) {
  const accepted = statuses.filter((status) => status === "ACCEPTED").length;
  const reviewed = statuses.filter((status) => status !== "PENDING").length;
  return {
    pending: statuses.length - reviewed,
    reviewed,
    accepted,
    acceptanceRate: reviewed === 0 ? 0 : Math.round((accepted / reviewed) * 100),
  };
}
