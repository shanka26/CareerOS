import { ArrowUpRight } from "lucide-react";

import { buildExternalJobSearches } from "./external-job-searches";

export function CommonJobBoards({
  query,
  location,
  remote,
}: {
  query: string;
  location: string;
  remote: "any" | "remote" | "onsite";
}) {
  const searches = buildExternalJobSearches({ query, location, remote });

  return (
    <section aria-labelledby="common-job-boards-heading" className="mt-5 rounded-2xl border border-[var(--line)] bg-white/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="common-job-boards-heading" className="font-bold">Search common job platforms</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--muted)]">
            These platforms do not provide CareerOS with an open listing-search API. Open the same search directly on each platform; results stay on that platform.
          </p>
        </div>
        <p className="text-xs font-semibold text-[var(--muted)]">Opens in a new tab</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {searches.map((search) => (
          <a key={search.id} href={search.url} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] bg-white px-4 text-xs font-bold transition hover:-translate-y-0.5 hover:border-[var(--ink)]">
            {search.label}<ArrowUpRight className="ml-1 size-3" />
          </a>
        ))}
      </div>
    </section>
  );
}
