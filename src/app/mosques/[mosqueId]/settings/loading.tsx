export default function SettingsLoading() {
  return (
    <div className="max-w-3xl space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted/60 rounded" />
      </div>

      {/* Form Cards Skeleton */}
      <div className="space-y-6">
        {/* General Details Card */}
        <div className="p-6 bg-card rounded-xl border border-border/60 space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-muted/60 rounded" />
              <div className="h-9 w-full bg-muted/40 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-muted/60 rounded" />
              <div className="h-9 w-full bg-muted/40 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-muted/60 rounded" />
              <div className="h-9 w-full bg-muted/40 rounded-lg" />
            </div>
          </div>
          <div className="pt-2">
            <div className="h-9 w-32 bg-muted rounded-md" />
          </div>
        </div>

        {/* Transparency Page Card */}
        <div className="p-6 bg-card rounded-xl border border-border/60 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-3.5 w-72 bg-muted/60 rounded" />
          </div>
          <div className="h-6 w-11 bg-muted rounded-full" />
        </div>

        {/* Danger Zone Card */}
        <div className="p-6 bg-card rounded-xl border border-destructive/20 space-y-3">
          <div className="h-5 w-36 bg-destructive/40 rounded" />
          <div className="h-3.5 w-80 bg-muted/60 rounded" />
          <div className="pt-2">
            <div className="h-9 w-36 bg-destructive/20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

