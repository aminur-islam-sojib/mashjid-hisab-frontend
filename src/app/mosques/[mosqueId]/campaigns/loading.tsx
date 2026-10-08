export default function CampaignsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted/60 rounded" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-md" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="p-4 bg-card rounded-xl border border-border/60 flex flex-col sm:flex-row gap-3">
        <div className="h-9 flex-1 bg-muted/60 rounded-lg" />
        <div className="h-9 w-48 bg-muted/60 rounded-lg" />
      </div>

      {/* Campaigns Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-muted/70 rounded-full" />
              <div className="h-5 w-16 bg-muted/60 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-3.5 w-full bg-muted/50 rounded" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-muted/50 rounded" />
                <div className="h-3 w-12 bg-muted/50 rounded" />
              </div>
              <div className="h-2 w-full bg-muted/60 rounded-full" />
              <div className="flex justify-between pt-1">
                <div className="h-4 w-20 bg-muted/80 rounded" />
                <div className="h-4 w-20 bg-muted/50 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

