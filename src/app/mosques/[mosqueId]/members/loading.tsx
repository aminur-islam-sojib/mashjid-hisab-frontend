export default function MembersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted/60 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-muted rounded-md" />
          <div className="h-9 w-28 bg-muted rounded-md" />
        </div>
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="p-4 bg-card rounded-xl border border-border/60 flex flex-col sm:flex-row gap-3">
        <div className="h-9 flex-1 bg-muted/60 rounded-lg" />
        <div className="h-9 w-36 bg-muted/60 rounded-lg" />
        <div className="h-9 w-36 bg-muted/60 rounded-lg" />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/60 p-4 bg-muted/20">
          <div className="grid grid-cols-6 gap-4">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-muted/80 rounded" />
                  <div className="h-3 w-36 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-muted/60 rounded" />
              <div className="h-5 w-20 bg-muted/70 rounded-full" />
              <div className="h-5 w-16 bg-muted/70 rounded-full" />
              <div className="h-4 w-24 bg-muted/60 rounded" />
              <div className="h-4 w-12 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

