export default function AuditLogsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted/60 rounded" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="p-4 bg-card rounded-xl border border-border/60 flex flex-col sm:flex-row gap-3">
        <div className="h-9 flex-1 bg-muted/60 rounded-lg" />
        <div className="h-9 w-44 bg-muted/60 rounded-lg" />
        <div className="h-9 w-44 bg-muted/60 rounded-lg" />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/60 p-4 bg-muted/20">
          <div className="grid grid-cols-5 gap-4">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-36 bg-muted rounded" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-5 gap-4 items-center">
              <div className="h-4 w-32 bg-muted/50 rounded font-mono" />
              <div className="h-4 w-28 bg-muted/70 rounded" />
              <div className="h-5 w-24 bg-muted/60 rounded-full" />
              <div className="h-4 w-20 bg-muted/60 rounded" />
              <div className="h-4 w-56 bg-muted/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

