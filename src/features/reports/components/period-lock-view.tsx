"use client";

import * as React from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeriodLockViewProps {
  targetPeriod: string;
  onTargetPeriodChange: (val: string) => void;
  onClosePeriod: () => void;
  onOpenReopenModal: () => void;
  isClosing: boolean;
}

export function PeriodLockView({
  targetPeriod,
  onTargetPeriodChange,
  onClosePeriod,
  onOpenReopenModal,
  isClosing,
}: PeriodLockViewProps) {
  return (
    <div className="p-3.5 sm:p-4 bg-muted/40 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs print:hidden">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span>
          <strong className="text-foreground">Accounting period:</strong> Month {targetPeriod} is open. Period locks make all historical entries strictly immutable.
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
        <input
          type="month"
          value={targetPeriod}
          onChange={(e) => onTargetPeriodChange(e.target.value)}
          className="px-2.5 py-1 text-xs border border-border bg-card rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
          title="Select accounting period"
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-xs h-7 rounded-md text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={onClosePeriod}
          disabled={isClosing}
        >
          <Lock className="w-3 h-3 mr-1" />
          {isClosing ? "Closing..." : "Close & Lock Month"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-xs h-7 rounded-md text-amber-600 hover:bg-amber-500/10"
          onClick={onOpenReopenModal}
        >
          <Unlock className="w-3 h-3 mr-1" />
          Reopen
        </Button>
      </div>
    </div>
  );
}
