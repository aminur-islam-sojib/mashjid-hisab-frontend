export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted/60 rounded" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 p-1 bg-muted/40 rounded-xl w-fit border border-border/80">
        <div className="h-7 w-24 bg-muted rounded-lg" />
        <div className="h-7 w-24 bg-muted/60 rounded-lg" />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/60 p-4 bg-muted/20">
          <div className="grid grid-cols-5 gap-4">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-5 gap-4 items-center">
              <div className="h-4 w-36 bg-muted/80 rounded" />
              <div className="h-5 w-16 bg-muted/60 rounded-full" />
              <div className="h-4 w-48 bg-muted/40 rounded" />
              <div className="h-5 w-16 bg-muted/70 rounded-full" />
              <div className="h-4 w-16 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

