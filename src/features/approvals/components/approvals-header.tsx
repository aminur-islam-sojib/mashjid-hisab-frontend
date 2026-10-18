"use client";

import * as React from "react";
import { Download, History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalsHeaderProps {
  totalPending: number;
  onExport: () => void;
  onNavigateToMasterLedger: () => void;
  onRefresh: () => void;
}

export function ApprovalsHeader({
  totalPending,
  onExport,
  onNavigateToMasterLedger,
  onRefresh,
}: ApprovalsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Approvals Queue
          </h1>
          {totalPending > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              {totalPending} awaiting signoff
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and track pending recordings, donations, and cash collections awaiting dual-control verification.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="text-xs rounded-xl font-medium shadow-2xs gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateToMasterLedger}
          className="text-xs rounded-xl font-medium shadow-2xs gap-1.5"
        >
          <History className="w-3.5 h-3.5 text-muted-foreground" />
          Master Ledger
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-xs rounded-xl font-medium shadow-2xs gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

