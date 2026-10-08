export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted/60 rounded" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-lg w-fit">
        <div className="h-8 w-32 bg-muted rounded-md" />
        <div className="h-8 w-28 bg-muted/60 rounded-md" />
        <div className="h-8 w-28 bg-muted/60 rounded-md" />
        <div className="h-8 w-28 bg-muted/60 rounded-md" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="p-4 bg-card rounded-xl border border-border/60 flex flex-wrap gap-4 items-center">
        <div className="h-8 w-36 bg-muted/60 rounded-lg" />
        <div className="h-8 w-36 bg-muted/60 rounded-lg" />
        <div className="h-8 w-36 bg-muted/60 rounded-lg" />
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 bg-card rounded-xl border border-border/60 space-y-2">
            <div className="h-4 w-24 bg-muted/60 rounded" />
            <div className="h-7 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/60 p-4 bg-muted/20">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded ml-auto" />
            <div className="h-4 w-20 bg-muted rounded ml-auto" />
            <div className="h-4 w-20 bg-muted rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-4 gap-4 items-center">
              <div className="h-4 w-40 bg-muted/70 rounded" />
              <div className="h-4 w-20 bg-muted/60 rounded ml-auto" />
              <div className="h-4 w-20 bg-muted/60 rounded ml-auto" />
              <div className="h-4 w-24 bg-muted/90 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

