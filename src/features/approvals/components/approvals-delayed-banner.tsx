"use client";

import * as React from "react";
import { Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalsDelayedBannerProps {
  activeDelayedCount: number;
  onCancelAll: () => void;
}

export function ApprovalsDelayedBanner({
  activeDelayedCount,
  onCancelAll,
}: ApprovalsDelayedBannerProps) {
  if (activeDelayedCount <= 0) return null;

  return (
    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-600 animate-spin" />
        <span>
          <strong>{activeDelayedCount} transaction(s)</strong> committing to ledger. You have a 5-second undo grace period.
        </span>
      </div>
      <Button
        size="xs"
        variant="outline"
        onClick={onCancelAll}
        className="border-amber-600 text-amber-700 dark:text-amber-300 font-semibold"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1" />
        Undo All ({activeDelayedCount})
      </Button>
    </div>
  );
}

