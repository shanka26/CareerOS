"use client";

import { ArrowUpRight, BookmarkPlus, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { JobSearchProviderStatus, JobSearchResult, JobSearchSuggestions } from "./search/types";
import { messageFromError, requestJson } from "@/shared/lib/api-client";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ProcessingIndicator } from "@/shared/ui/processing-indicator";

type SortOption = "match" | "newest" | "salary" | "title";
type SearchResponse = { results: JobSearchResult[]; providers: JobSearchProviderStatus[]; suggestions: JobSearchSuggestions };

export function JobSearch({ initialSuggestions }: { initialSuggestions: JobSearchSuggestions }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialSuggestions.prompts[0] ?? "");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState<"any" | "remote" | "onsite">("any");
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [providers, setProviders] = useState<JobSearchProviderStatus[]>([]);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [source, setSource] = useState("all");
  const [salaryOnly, setSalaryOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("match");
  const [searched, setSearched] = useState(false);
  const [pending, setPending] = useState(false);
  const [importingId, setImportingId] = useState<string>();
  const [error, setError] = useState<string>();

  const displayedResults = useMemo(() => {
    const filtered = results.filter((job) => (source === "all" || job.source === source) && (!salaryOnly || job.salaryMin != null || job.salaryMax != null));
    return [...filtered].sort((a, b) => {
      if (sort === "newest") return (b.postedAt ?? "").localeCompare(a.postedAt ?? "");
      if (sort === "salary") return (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.matchScore - a.matchScore;
    });
  }, [results, salaryOnly, sort, source]);

  async function runSearch(term = query) {
    const normalized = term.trim();
    if (normalized.length < 2) return setError("Enter at least two characters to search jobs.");
    setQuery(normalized);
    setPending(true);
    setError(undefined);
    try {
      const params = new URLSearchParams({ q: normalized, location: location.trim(), remote });
      const response = await requestJson<SearchResponse>(`/api/jobs/search?${params}`, { method: "GET" }, "Job search failed.");
      setResults(response.results);
      setProviders(response.providers);
      setSuggestions(response.suggestions);
      setSearched(true);
      if (source !== "all" && !response.results.some((job) => job.source === source)) setSource("all");
    } catch (requestError) {
      setError(messageFromError(requestError, "Job search failed."));
    } finally {
      setPending(false);
    }
  }

  async function importResult(job: JobSearchResult) {
    setImportingId(job.id);
    setError(undefined);
    const salary = formatSalary(job);
    const text = [
      `Title: ${job.title}`, `Company: ${job.company}`, `Location: ${job.location}`,
      job.employmentType ? `Employment type: ${job.employmentType}` : null,
      salary ? `Salary: ${salary}` : null, "", job.description,
    ].filter((value) => value != null).join("\n");
    try {
      const response = await requestJson<{ id?: string }>("/api/jobs", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, sourceUrl: job.url }),
      }, "The listing could not be added to CareerOS.");
      if (!response.id) throw new Error("The job import returned an incomplete response.");
      router.push(`/dashboard/jobs/${response.id}`);
    } catch (requestError) {
      setError(messageFromError(requestError, "The listing could not be added to CareerOS."));
    } finally {
      setImportingId(undefined);
    }
  }

  return (
    <section aria-labelledby="job-search-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Across configured job boards</p><h2 id="job-search-heading" className="mt-1 text-2xl font-bold">Search jobs in one place</h2></div>
        <p className="max-w-xl text-sm text-[var(--muted)]">CareerOS combines live provider results, removes obvious duplicates, and scores matches using only your verified skills.</p>
      </div>

      <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_.55fr_auto_auto]" aria-busy={pending} onSubmit={(event) => { event.preventDefault(); void runSearch(); }}>
        <label className="grid gap-1 text-xs font-bold">Role, skill, or keyword<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Platform engineer TypeScript" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-bold">Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Chicago or United States" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-bold">Workplace<select value={remote} onChange={(event) => setRemote(event.target.value as typeof remote)} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-3 text-sm font-normal"><option value="any">Any</option><option value="remote">Remote</option><option value="onsite">On-site / hybrid</option></select></label>
        <Button className="self-end" disabled={pending}>{pending ? "Searching..." : <><Search className="mr-2 size-4" />Search jobs</>}</Button>
      </form>

      {suggestions.prompts.length || suggestions.keywords.length ? <div className="mt-4 grid gap-3"><SuggestionRow label="Suggested searches" values={suggestions.prompts} onSelect={(value) => void runSearch(value)} disabled={pending} /><SuggestionRow label="Profile keywords" values={suggestions.keywords} onSelect={setQuery} disabled={pending} /></div> : null}
      {pending ? <div className="mt-5"><ProcessingIndicator title="Searching configured job boards" description="CareerOS is normalizing listings, removing duplicates, and calculating evidence-based profile matches." /></div> : null}
      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      {providers.length ? <div className="mt-5 flex flex-wrap gap-2" aria-label="Job source status">{providers.map((provider) => <span key={provider.id} title={provider.message} className={`rounded-full border px-3 py-1 text-xs font-bold ${provider.status === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : provider.status === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[var(--line)] bg-white/60 text-[var(--muted)]"}`}>{provider.label}: {provider.status === "ok" ? provider.resultCount : provider.status}</span>)}</div> : null}

      {searched ? <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-y border-[var(--line)] py-4"><p className="font-bold">{displayedResults.length} of {results.length} listings</p><div className="flex flex-wrap gap-3"><FilterSelect label="Source" value={source} onChange={setSource} options={[{ value: "all", label: "All sources" }, ...providers.filter(({ status, resultCount }) => status === "ok" && resultCount > 0).map(({ id, label }) => ({ value: id, label }))]} /><FilterSelect label="Sort" value={sort} onChange={(value) => setSort(value as SortOption)} options={[{ value: "match", label: "Best match" }, { value: "newest", label: "Newest" }, { value: "salary", label: "Highest salary" }, { value: "title", label: "Title A-Z" }]} /><label className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 text-xs font-bold"><SlidersHorizontal className="size-3" /><input type="checkbox" checked={salaryOnly} onChange={(event) => setSalaryOnly(event.target.checked)} />Salary listed</label></div></div> : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">{displayedResults.map((job) => <JobResultCard key={job.id} job={job} importing={importingId === job.id} disabled={Boolean(importingId)} onImport={() => void importResult(job)} />)}</div>
      {searched && !displayedResults.length && !pending ? <Card className="mt-5 p-8 text-center"><p className="font-bold">No matching listings found.</p><p className="mt-2 text-sm text-[var(--muted)]">Try a broader keyword, remove a location, or select another suggested search.</p></Card> : null}
    </section>
  );
}

function SuggestionRow({ label, values, onSelect, disabled }: { label: string; values: string[]; onSelect: (value: string) => void; disabled: boolean }) {
  if (!values.length) return null;
  return <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-[var(--muted)]">{label}</span>{values.map((value) => <button key={value} type="button" disabled={disabled} onClick={() => onSelect(value)} className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-xs font-semibold hover:bg-white disabled:opacity-50">{value}</button>)}</div>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return <label className="grid gap-1 text-xs font-bold">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 rounded-xl border border-[var(--line)] bg-white px-3 font-normal">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function JobResultCard({ job, importing, disabled, onImport }: { job: JobSearchResult; importing: boolean; disabled: boolean; onImport: () => void }) {
  const salary = formatSalary(job);
  return <Card className="flex h-full flex-col p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">{job.sourceLabel}</p><h3 className="mt-1 text-lg font-bold">{job.title}</h3><p className="text-sm text-[var(--muted)]">{job.company} · {job.location}</p></div><span className="rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-black">{job.matchScore}%</span></div><div className="mt-3 flex flex-wrap gap-2 text-xs">{job.remote ? <span className="rounded-full bg-white px-2 py-1">Remote</span> : null}{job.employmentType ? <span className="rounded-full bg-white px-2 py-1">{job.employmentType}</span> : null}{salary ? <span className="rounded-full bg-white px-2 py-1">{salary}</span> : null}{job.postedAt ? <span className="rounded-full bg-white px-2 py-1">Posted {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(job.postedAt))}</span> : null}</div>{job.matchedSkills.length ? <p className="mt-3 text-xs"><strong>Profile matches:</strong> {job.matchedSkills.join(", ")}</p> : null}<p className="mt-4 line-clamp-4 text-sm leading-6 text-[var(--muted)]">{job.description || "Open the source listing for the complete description."}</p><div className="mt-auto flex flex-wrap gap-3 pt-5"><Button size="small" disabled={disabled} onClick={onImport}><BookmarkPlus className="mr-1 size-3" />{importing ? "Adding..." : "Analyze in CareerOS"}</Button><a href={job.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center px-2 text-xs font-bold underline">View on {job.sourceLabel}<ArrowUpRight className="ml-1 size-3" /></a></div></Card>;
}

function formatSalary(job: JobSearchResult) {
  if (job.salaryMin == null && job.salaryMax == null) return null;
  const formatter = new Intl.NumberFormat("en-US", { style: job.salaryCurrency ? "currency" : "decimal", ...(job.salaryCurrency ? { currency: job.salaryCurrency, maximumFractionDigits: 0 } : {}) });
  if (job.salaryMin != null && job.salaryMax != null) return `${formatter.format(job.salaryMin)}–${formatter.format(job.salaryMax)}`;
  return formatter.format(job.salaryMin ?? job.salaryMax ?? 0);
}
