import type { JobSearchResult } from "./types";

export function diversifyResults(results: JobSearchResult[]) {
  const queues = new Map<string, JobSearchResult[]>();
  for (const result of results) {
    const queue = queues.get(result.source);
    if (queue) queue.push(result);
    else queues.set(result.source, [result]);
  }

  const sourceOrder = [...queues.keys()].sort((left, right) =>
    (queues.get(right)?.[0]?.matchScore ?? 0) - (queues.get(left)?.[0]?.matchScore ?? 0));
  const diversified: JobSearchResult[] = [];

  while (diversified.length < results.length) {
    for (const source of sourceOrder) {
      const next = queues.get(source)?.shift();
      if (next) diversified.push(next);
    }
  }
  return diversified;
}
