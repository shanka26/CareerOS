"use client";

import { ArrowUpRight, BookmarkPlus, LoaderCircle, Search } from "lucide-react";
import { useState } from "react";
import type { JobSearchResult } from "./job-search";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type SearchResponse = { jobs?: JobSearchResult[]; attribution?: string; error?: string };

export function JobSearchForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [pending, setPending] = useState(false);
  const [savingUrl, setSavingUrl] = useState<string>();
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();

  return (
    <div>
      <form className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]" onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        for (const key of ["q", "company", "location"] as const) {
          const value = String(data.get(key) ?? "").trim();
          if (value) params.set(key, value);
        }
        setPending(true); setError(undefined); setSearched(true);
        try {
          const response = await fetch(`/api/jobs/search?${params}`);
          const result = await response.json() as SearchResponse;
          if (!response.ok) throw new Error(result.error ?? "Search failed.");
          setJobs(result.jobs ?? []);
        } catch (searchError) {
          setJobs([]); setError(searchError instanceof Error ? searchError.message : "Search failed.");
        } finally { setPending(false); }
      }}>
        <label className="grid gap-2 text-sm font-semibold">Role or keyword<input name="q" defaultValue={defaultQuery} placeholder="Product engineer" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Company<input name="company" placeholder="Acme" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal" /></label>
        <label className="grid gap-2 text-sm font-semibold">Candidate location<input name="location" placeholder="USA or Worldwide" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-normal" /></label>
        <Button className="self-end" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}Search</Button>
      </form>
      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {searched && !pending && !error ? <p className="mt-5 text-sm text-[var(--muted)]">{jobs.length ? `${jobs.length} matching remote roles` : "No matching roles found. Try a broader keyword or location."}</p> : null}
      <div className="mt-4 grid gap-3">
        {jobs.map((job) => <Card key={job.sourceId} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[var(--accent)]"><span>{job.company}</span><span className="text-[var(--muted)]">via {job.source}</span></div>
              <h3 className="mt-1 text-lg font-bold">{job.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]"><span>{job.location}</span>{job.employmentType ? <><span>•</span><span className="capitalize">{job.employmentType}</span></> : null}{job.salary ? <><span>•</span><span>{job.salary}</span></> : null}</div>
              <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{job.description}</p>
            </div>
            <div className="flex gap-2">
              <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-bold">View <ArrowUpRight className="size-4" /></a>
              {saved[job.sourceUrl] ? <a href={`/dashboard/jobs/${saved[job.sourceUrl]}`} className="inline-flex min-h-10 items-center rounded-full bg-[var(--lime)] px-4 text-sm font-bold">Open workspace</a> : <Button type="button" disabled={savingUrl === job.sourceUrl} onClick={async () => {
                setSavingUrl(job.sourceUrl); setError(undefined);
                const response = await fetch("/api/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ discoveredJob: job }) });
                const result = await response.json() as { id?: string; error?: string };
                if (response.ok && result.id) setSaved((current) => ({ ...current, [job.sourceUrl]: result.id! })); else setError(result.error ?? "Could not save this job.");
                setSavingUrl(undefined);
              }}>{savingUrl === job.sourceUrl ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <BookmarkPlus className="mr-2 size-4" />}Save</Button>}
            </div>
          </div>
        </Card>)}
      </div>
      {searched ? <p className="mt-5 text-xs text-[var(--muted)]">Jobs provided by <a className="font-bold underline" href="https://remotive.com/remote-jobs" target="_blank" rel="noreferrer">Remotive</a>. Results link to the original Remotive listing.</p> : null}
    </div>
  );
}
