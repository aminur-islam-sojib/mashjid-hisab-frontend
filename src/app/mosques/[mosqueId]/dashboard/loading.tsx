export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="h-36 rounded-2xl bg-muted/60 border border-border/60 p-6 flex flex-col justify-between" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-card border border-border/60 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-card border border-border/60 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3.5 w-20 bg-muted rounded" />
              <div className="h-2.5 w-14 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Treasury Overview Grid: Accounts & Funds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl bg-card border border-border/60 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-muted" />
                <div className="h-5 w-36 bg-muted rounded" />
              </div>
              <div className="h-5 w-20 bg-muted rounded" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-14 rounded-lg bg-muted/40 p-3 flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

