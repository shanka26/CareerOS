"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState } from "react";

import { Button } from "@/shared/ui/button";
import { messageFromError, requestJson } from "@/shared/lib/api-client";

import type { ResumeAnalysis, StoredResumeAnalysis } from "./analysis-schema";
import { approveResumeAnalysisSchema } from "./schemas";

type FieldErrors = Record<string, string>;
const FieldErrorContext = createContext<FieldErrors>({});

export function ResumeReviewForm({ suggestionId, draft }: { suggestionId: string; draft: StoredResumeAnalysis }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <FieldErrorContext.Provider value={fieldErrors}>
    <form
      ref={formRef}
      className="grid gap-7"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError(undefined);
        setFieldErrors({});
        const value = (name: string) => String(data.get(name) ?? "").trim();
        const nullable = (name: string) => value(name) || null;
        const included = (name: string) => data.get(name) === "on";
        const list = (name: string) => value(name).split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
        const currentValue = (name: string) => value(name) === "true" ? true : value(name) === "false" ? false : null;

        const experienceIndexes = selectedIndexes(draft.experiences.length, (index) => included(`experience.${index}.include`));
        const achievementIndexes = experienceIndexes.map((experienceIndex) => selectedIndexes(
          draft.experiences[experienceIndex]!.achievements.length,
          (achievementIndex) => included(`experience.${experienceIndex}.achievement.${achievementIndex}.include`),
        ));
        const skillIndexes = selectedIndexes(draft.skills.length, (index) => included(`skill.${index}.include`));
        const projectIndexes = selectedIndexes(draft.projects.length, (index) => included(`project.${index}.include`));
        const educationIndexes = selectedIndexes(draft.education.length, (index) => included(`education.${index}.include`));
        const certificationIndexes = selectedIndexes(draft.certifications.length, (index) => included(`certification.${index}.include`));

        const body = {
          suggestionId,
          headline: nullable("headline"),
          summary: nullable("summary"),
          targetRole: nullable("targetRole"),
          preferredLocations: list("preferredLocations"),
          remotePreference: nullable("remotePreference"),
          careerGoals: list("careerGoals"),
          salaryExpectation: nullable("salaryExpectation"),
          experiences: experienceIndexes.map((index, selectedIndex) => ({
            company: value(`experience.${index}.company`),
            title: value(`experience.${index}.title`),
            startDate: nullable(`experience.${index}.startDate`),
            endDate: nullable(`experience.${index}.endDate`),
            current: currentValue(`experience.${index}.current`),
            description: value(`experience.${index}.description`),
            achievements: (achievementIndexes[selectedIndex] ?? []).map((achievementIndex) => ({
              description: value(`experience.${index}.achievement.${achievementIndex}.description`),
              metric: nullable(`experience.${index}.achievement.${achievementIndex}.metric`),
              quantified: included(`experience.${index}.achievement.${achievementIndex}.quantified`),
            })),
          })),
          skills: skillIndexes.map((index) => ({
            name: value(`skill.${index}.name`),
            category: value(`skill.${index}.category`),
            proficiency: nullable(`skill.${index}.proficiency`),
          })),
          projects: projectIndexes.map((index) => ({
            name: value(`project.${index}.name`),
            description: value(`project.${index}.description`),
            impact: nullable(`project.${index}.impact`),
            technologies: list(`project.${index}.technologies`),
          })),
          education: educationIndexes.map((index) => ({
            school: value(`education.${index}.school`),
            degree: nullable(`education.${index}.degree`),
            field: nullable(`education.${index}.field`),
            graduationDate: nullable(`education.${index}.graduationDate`),
          })),
          certifications: certificationIndexes.map((index) => ({
            name: value(`certification.${index}.name`),
            issuer: value(`certification.${index}.issuer`),
            issueDate: nullable(`certification.${index}.issueDate`),
            expirationDate: nullable(`certification.${index}.expirationDate`),
          })),
        };

        const parsed = approveResumeAnalysisSchema.safeParse(body);
        if (!parsed.success) {
          const indexes = { experienceIndexes, achievementIndexes, skillIndexes, projectIndexes, educationIndexes, certificationIndexes };
          const nextErrors = Object.fromEntries(parsed.error.issues.map((issue) => {
            const target = validationTarget(issue.path, indexes);
            return [target.name, issue.message];
          }));
          setFieldErrors(nextErrors);
          setError(`${Object.keys(nextErrors).length} selected ${Object.keys(nextErrors).length === 1 ? "field needs" : "fields need"} attention. Choose a field below to review it.`);
          setPending(false);
          requestAnimationFrame(() => focusField(formRef.current, Object.keys(nextErrors)[0]));
          return;
        }

        try {
          await requestJson("/api/career/resume/approve", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(parsed.data),
          }, "The profile could not be saved.");
          router.refresh();
        } catch (requestError) {
          setError(messageFromError(requestError, "The profile could not be saved."));
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Review required.</strong> AI filled only values supported by the resume. Edit any value, uncheck any item you do not want, and approve when it is accurate.</div>

      <ResumeAnalysisReport report={draft.report} provenance={draft.provenance} />

      <Section title="Profile foundation">
        <TextField label="Professional headline" name="headline" defaultValue={draft.profile.headline.value ?? ""} evidence={draft.profile.headline.evidence} />
        <TextArea label="Career summary" name="summary" rows={5} defaultValue={draft.profile.summary.value ?? ""} evidence={draft.profile.summary.evidence} />
        <TextField label="Target role" name="targetRole" defaultValue={draft.profile.targetRole.value ?? ""} evidence={draft.profile.targetRole.evidence} />
        <TextField label="Preferred locations (comma-separated)" name="preferredLocations" defaultValue={draft.profile.preferredLocations.values.join(", ")} evidence={draft.profile.preferredLocations.evidence} />
        <label className="grid gap-2 text-sm font-semibold">Work preference<select name="remotePreference" defaultValue={draft.profile.remotePreference.value ?? ""} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"><option value="">Not stated</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-site</option><option value="FLEXIBLE">Flexible</option></select><Evidence excerpts={draft.profile.remotePreference.evidence} /></label>
        <TextArea label="Career goals (one per line)" name="careerGoals" rows={3} defaultValue={draft.profile.careerGoals.values.join("\n")} evidence={draft.profile.careerGoals.evidence} />
        <TextField label="Salary expectations" name="salaryExpectation" defaultValue={draft.profile.salaryExpectation.value ?? ""} evidence={draft.profile.salaryExpectation.evidence} />
      </Section>

      <Section title={`Experience (${draft.experiences.length})`}>
        {draft.experiences.length ? draft.experiences.map((experience, index) => <fieldset key={`${experience.company}-${experience.title}-${index}`} className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white/50 p-5">
          <Include name={`experience.${index}.include`} label="Include this experience" />
          <div className="grid gap-4 sm:grid-cols-2"><TextField label="Company" name={`experience.${index}.company`} defaultValue={experience.company} /><TextField label="Title" name={`experience.${index}.title`} defaultValue={experience.title} /></div>
          <div className="grid gap-4 sm:grid-cols-3"><TextField label="Start date" name={`experience.${index}.startDate`} defaultValue={experience.startDate ?? ""} /><TextField label="End date" name={`experience.${index}.endDate`} defaultValue={experience.endDate ?? ""} /><label className="grid gap-2 text-sm font-semibold">Employment status<select name={`experience.${index}.current`} defaultValue={experience.current == null ? "" : String(experience.current)} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal"><option value="">Not explicit</option><option value="true">Current</option><option value="false">Ended</option></select></label></div>
          <TextArea label="Description" name={`experience.${index}.description`} rows={4} defaultValue={experience.description} />
          <Evidence excerpts={experience.evidence} />
          {experience.achievements.map((achievement, achievementIndex) => <div key={achievementIndex} className="grid gap-3 rounded-xl bg-[var(--paper)] p-4"><Include name={`experience.${index}.achievement.${achievementIndex}.include`} label="Include achievement" /><TextArea label="Achievement" name={`experience.${index}.achievement.${achievementIndex}.description`} rows={2} defaultValue={achievement.description} /><TextField label="Metric" name={`experience.${index}.achievement.${achievementIndex}.metric`} defaultValue={achievement.metric ?? ""} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`experience.${index}.achievement.${achievementIndex}.quantified`} defaultChecked={achievement.quantified} /> Quantified result</label><Evidence excerpts={achievement.evidence} /></div>)}
        </fieldset>) : <Empty />}
      </Section>

      <Section title={`Skills (${draft.skills.length})`}>
        {draft.skills.length ? <div className="grid gap-3 sm:grid-cols-2">{draft.skills.map((skill, index) => <fieldset key={`${skill.name}-${index}`} className="grid gap-3 rounded-xl border border-[var(--line)] bg-white/50 p-4"><Include name={`skill.${index}.include`} label="Include skill" /><TextField label="Skill" name={`skill.${index}.name`} defaultValue={skill.name} /><TextField label="Category" name={`skill.${index}.category`} defaultValue={skill.category} /><TextField label="Proficiency" name={`skill.${index}.proficiency`} defaultValue={skill.proficiency ?? ""} /><Evidence excerpts={skill.evidence} /></fieldset>)}</div> : <Empty />}
      </Section>

      <Section title={`Projects (${draft.projects.length})`}>
        {draft.projects.length ? draft.projects.map((project, index) => <fieldset key={`${project.name}-${index}`} className="grid gap-3 rounded-xl border border-[var(--line)] bg-white/50 p-4"><Include name={`project.${index}.include`} label="Include project" /><TextField label="Project" name={`project.${index}.name`} defaultValue={project.name} /><TextArea label="Description" name={`project.${index}.description`} rows={3} defaultValue={project.description} /><TextArea label="Impact" name={`project.${index}.impact`} rows={2} defaultValue={project.impact ?? ""} /><TextField label="Technologies (comma-separated)" name={`project.${index}.technologies`} defaultValue={project.technologies.join(", ")} /><Evidence excerpts={project.evidence} /></fieldset>) : <Empty />}
      </Section>

      <Section title={`Education (${draft.education.length})`}>
        {draft.education.length ? draft.education.map((education, index) => <fieldset key={`${education.school}-${index}`} className="grid gap-3 rounded-xl border border-[var(--line)] bg-white/50 p-4"><Include name={`education.${index}.include`} label="Include education" /><TextField label="School" name={`education.${index}.school`} defaultValue={education.school} /><div className="grid gap-4 sm:grid-cols-3"><TextField label="Degree" name={`education.${index}.degree`} defaultValue={education.degree ?? ""} /><TextField label="Field" name={`education.${index}.field`} defaultValue={education.field ?? ""} /><TextField label="Graduation date" name={`education.${index}.graduationDate`} defaultValue={education.graduationDate ?? ""} /></div><Evidence excerpts={education.evidence} /></fieldset>) : <Empty />}
      </Section>

      <Section title={`Certifications (${draft.certifications.length})`}>
        {draft.certifications.length ? draft.certifications.map((certification, index) => <fieldset key={`${certification.name}-${index}`} className="grid gap-3 rounded-xl border border-[var(--line)] bg-white/50 p-4"><Include name={`certification.${index}.include`} label="Include certification" defaultChecked={Boolean(certification.issuer)} /><TextField label="Certification" name={`certification.${index}.name`} defaultValue={certification.name} /><TextField label="Issuer (required to include)" name={`certification.${index}.issuer`} defaultValue={certification.issuer ?? ""} /><div className="grid gap-4 sm:grid-cols-2"><TextField label="Issue date" name={`certification.${index}.issueDate`} defaultValue={certification.issueDate ?? ""} /><TextField label="Expiration date" name={`certification.${index}.expirationDate`} defaultValue={certification.expirationDate ?? ""} /></div><Evidence excerpts={certification.evidence} /></fieldset>) : <Empty />}
      </Section>

      {draft.additionalFacts.length ? <Section title="Additional resume facts"><div className="grid gap-3">{draft.additionalFacts.map((fact, index) => <div key={`${fact.label}-${index}`} className="rounded-xl border border-[var(--line)] bg-white/50 p-4"><p className="font-bold">{fact.label}</p><p className="mt-1 text-sm">{fact.value}</p><Evidence excerpts={fact.evidence} /></div>)}</div></Section> : null}

      <details className="rounded-2xl border border-[var(--line)] bg-white/50 p-4"><summary className="cursor-pointer font-bold">Compare everything against extracted resume text</summary><pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[var(--muted)]">{draft.rawText}</pre></details>
      {error ? <ValidationSummary message={error} errors={fieldErrors} onFocus={(name) => focusField(formRef.current, name)} /> : null}
      <Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}Approve selected career facts</Button>
    </form>
    </FieldErrorContext.Provider>
  );
}

export function ResumeAnalysisReport({ report, provenance }: { report: ResumeAnalysis["report"]; provenance: StoredResumeAnalysis["provenance"] }) {
  return <Section title="AI resume report">
    <p className="leading-7">{report.executiveSummary.text}</p>
    <Evidence excerpts={report.executiveSummary.evidence} />
    <ReportList title="Evidence-backed strengths" items={report.strengths} />
    <ReportList title="Improvement opportunities" items={report.improvementOpportunities} />
    {report.missingFields.length ? <SimpleList title="Information not present in the resume" items={report.missingFields} /> : null}
    {report.followUpQuestions.length ? <SimpleList title="Questions that can strengthen your profile" items={report.followUpQuestions} /> : null}
    <p className="text-xs text-[var(--muted)]">Analyzed by {provenance.provider} / {provenance.model}</p>
  </Section>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white/30 p-5"><h3 className="text-lg font-bold">{title}</h3>{children}</section>;
}

function Include({ name, label, defaultChecked = true }: { name: string; label: string; defaultChecked?: boolean }) {
  return <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name={name} defaultChecked={defaultChecked} /> {label}</label>;
}

function TextField({ label, name, defaultValue = "", evidence }: { label: string; name: string; defaultValue?: string; evidence?: string[] }) {
  const error = useContext(FieldErrorContext)[name];
  const errorId = `${fieldId(name)}-error`;
  return <label className="grid gap-2 text-sm font-semibold">{label}<input id={fieldId(name)} name={name} defaultValue={defaultValue} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`min-h-12 rounded-xl border bg-white px-4 font-normal outline-none focus:border-[var(--focus)] ${error ? "border-red-500 ring-2 ring-red-100" : "border-[var(--line)]"}`} />{error ? <span id={errorId} className="text-xs font-semibold text-red-700">{error}</span> : null}{evidence ? <Evidence excerpts={evidence} /> : null}</label>;
}

function TextArea({ label, name, rows, defaultValue = "", evidence }: { label: string; name: string; rows: number; defaultValue?: string; evidence?: string[] }) {
  const error = useContext(FieldErrorContext)[name];
  const errorId = `${fieldId(name)}-error`;
  return <label className="grid gap-2 text-sm font-semibold">{label}<textarea id={fieldId(name)} name={name} rows={rows} defaultValue={defaultValue} aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`rounded-xl border bg-white p-4 font-normal outline-none focus:border-[var(--focus)] ${error ? "border-red-500 ring-2 ring-red-100" : "border-[var(--line)]"}`} />{error ? <span id={errorId} className="text-xs font-semibold text-red-700">{error}</span> : null}{evidence ? <Evidence excerpts={evidence} /> : null}</label>;
}

function ValidationSummary({ message, errors, onFocus }: { message: string; errors: FieldErrors; onFocus: (name: string) => void }) {
  const entries = Object.entries(errors);
  return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p className="font-bold">{message}</p>{entries.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{entries.map(([name, issue]) => <li key={name}><button type="button" onClick={() => onFocus(name)} className="text-left font-semibold underline decoration-red-300 underline-offset-2">{fieldLabel(name)}: {issue}</button></li>)}</ul> : null}</div>;
}

function selectedIndexes(length: number, included: (index: number) => boolean) {
  return Array.from({ length }, (_, index) => index).filter(included);
}

interface ApprovalIndexes {
  experienceIndexes: number[];
  achievementIndexes: number[][];
  skillIndexes: number[];
  projectIndexes: number[];
  educationIndexes: number[];
  certificationIndexes: number[];
}

function validationTarget(path: PropertyKey[], indexes: ApprovalIndexes) {
  const [section, selectedIndex, nestedSection, nestedIndex, field] = path;
  if (section === "experiences" && typeof selectedIndex === "number") {
    const experienceIndex = indexes.experienceIndexes[selectedIndex] ?? selectedIndex;
    if (nestedSection === "achievements" && typeof nestedIndex === "number" && typeof field === "string") {
      const achievementIndex = indexes.achievementIndexes[selectedIndex]?.[nestedIndex] ?? nestedIndex;
      return { name: `experience.${experienceIndex}.achievement.${achievementIndex}.${field}` };
    }
    if (typeof nestedSection === "string") return { name: `experience.${experienceIndex}.${nestedSection}` };
  }

  const collectionMap: Record<string, { prefix: string; indexes: number[] }> = {
    skills: { prefix: "skill", indexes: indexes.skillIndexes },
    projects: { prefix: "project", indexes: indexes.projectIndexes },
    education: { prefix: "education", indexes: indexes.educationIndexes },
    certifications: { prefix: "certification", indexes: indexes.certificationIndexes },
  };
  if (typeof section === "string" && collectionMap[section] && typeof selectedIndex === "number" && typeof nestedSection === "string") {
    const collection = collectionMap[section];
    return { name: `${collection.prefix}.${collection.indexes[selectedIndex] ?? selectedIndex}.${nestedSection}` };
  }
  return { name: typeof section === "string" ? section : "headline" };
}

function focusField(form: HTMLFormElement | null, name?: string) {
  if (!form || !name) return;
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLElement) {
    field.scrollIntoView?.({ behavior: "smooth", block: "center" });
    field.focus({ preventScroll: true });
  }
}

function fieldId(name: string) {
  return `resume-field-${name.replace(/[^a-z0-9]+/gi, "-")}`;
}

function fieldLabel(name: string) {
  const labels: Record<string, string> = {
    headline: "Professional headline", summary: "Career summary", targetRole: "Target role",
    preferredLocations: "Preferred locations", remotePreference: "Work preference",
    careerGoals: "Career goals", salaryExpectation: "Salary expectations",
  };
  if (labels[name]) return labels[name];

  const parts = name.split(".");
  const fieldNames: Record<string, string> = {
    company: "Company", title: "Title", startDate: "Start date", endDate: "End date",
    description: "Description", metric: "Metric", name: "Name", category: "Category",
    proficiency: "Proficiency", impact: "Impact", technologies: "Technologies", school: "School",
    degree: "Degree", field: "Field", graduationDate: "Graduation date", issuer: "Issuer",
    issueDate: "Issue date", expirationDate: "Expiration date",
  };
  const sectionNames: Record<string, string> = { experience: "Experience", skill: "Skill", project: "Project", education: "Education", certification: "Certification", achievement: "Achievement" };
  const section = sectionNames[parts[0] ?? ""] ?? "Career profile";
  const number = Number(parts[1]);
  const nestedAchievement = parts[2] === "achievement" ? ` — Achievement ${Number(parts[3]) + 1}` : "";
  const field = fieldNames[parts.at(-1) ?? ""] ?? "Field";
  return `${section}${Number.isFinite(number) ? ` ${number + 1}` : ""}${nestedAchievement} — ${field}`;
}

function Evidence({ excerpts }: { excerpts: string[] }) {
  if (!excerpts.length) return null;
  return <details className="text-xs font-normal text-[var(--muted)]"><summary className="cursor-pointer font-semibold">Resume evidence ({excerpts.length})</summary><ul className="mt-2 grid gap-1 border-l-2 border-[var(--line)] pl-3">{excerpts.map((excerpt, index) => <li key={`${excerpt}-${index}`}>“{excerpt}”</li>)}</ul></details>;
}

function ReportList({ title, items }: { title: string; items: Array<{ text: string; evidence: string[] }> }) {
  if (!items.length) return null;
  return <div><h4 className="font-bold">{title}</h4><div className="mt-2 grid gap-3">{items.map((item, index) => <div key={`${item.text}-${index}`} className="rounded-xl bg-[var(--paper)] p-3 text-sm"><p>{item.text}</p><Evidence excerpts={item.evidence} /></div>)}</div></div>;
}

function SimpleList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="font-bold">{title}</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function Empty() {
  return <p className="text-sm text-[var(--muted)]">No supported information was found in this section.</p>;
}
