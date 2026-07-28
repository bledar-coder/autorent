export default function FleetLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-9 w-48 animate-pulse rounded bg-surface-elevated" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="h-80 animate-pulse rounded-xl bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="aspect-video animate-pulse bg-surface-elevated" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-surface-elevated" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-surface-elevated" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
