export default function DashboardLoading() {
  return <main className="mx-auto max-w-7xl animate-pulse px-5 py-10 sm:px-8" aria-label="Loading workspace"><div className="h-4 w-32 rounded bg-black/10" /><div className="mt-4 h-14 max-w-xl rounded-2xl bg-black/10" /><div className="mt-8 grid gap-5 md:grid-cols-3">{[1, 2, 3].map((item) => <div className="h-48 rounded-[1.5rem] bg-black/10" key={item} />)}</div></main>;
}
