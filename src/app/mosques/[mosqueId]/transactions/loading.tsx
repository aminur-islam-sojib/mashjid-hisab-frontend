export default function TransactionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted/60 rounded" />
        </div>
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="p-4 bg-card rounded-xl border border-border/60 flex flex-wrap gap-3">
        <div className="h-9 flex-1 min-w-[200px] bg-muted/60 rounded-lg" />
        <div className="h-9 w-32 bg-muted/60 rounded-lg" />
        <div className="h-9 w-32 bg-muted/60 rounded-lg" />
        <div className="h-9 w-32 bg-muted/60 rounded-lg" />
        <div className="h-9 w-32 bg-muted/60 rounded-lg" />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/60 p-4 bg-muted/20">
          <div className="grid grid-cols-7 gap-4">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded ml-auto" />
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-7 gap-4 items-center">
              <div className="h-4 w-24 bg-muted/60 rounded font-mono" />
              <div className="h-4 w-16 bg-muted/50 rounded" />
              <div className="h-4 w-32 bg-muted/70 rounded" />
              <div className="h-4 w-24 bg-muted/60 rounded" />
              <div className="h-5 w-16 bg-muted/70 rounded-full" />
              <div className="h-4 w-24 bg-muted/90 rounded ml-auto" />
              <div className="h-4 w-12 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

