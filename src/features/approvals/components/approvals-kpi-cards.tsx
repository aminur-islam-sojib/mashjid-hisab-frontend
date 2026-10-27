"use client";

import * as React from "react";
import { Clock, Wallet, Coins, TrendingDown, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { ApprovalKpis } from "../types";

interface ApprovalsKpiCardsProps {
  kpis: ApprovalKpis;
}

export function ApprovalsKpiCards({ kpis }: ApprovalsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1: Total Pending */}
      <div className="bg-card rounded-[14px] border border-border p-5   flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Pending
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#006B5B] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
            {kpis.totalCount}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Dual Control
            </span>
            <span className="text-xs text-muted-foreground">needs verification</span>
          </div>
        </div>
      </div>

      {/* Card 2: Pending Volume (Pipeline Value) */}
      <div className="bg-card rounded-[14px] border border-border p-5   flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Volume
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#006B5B] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            {formatCurrency(kpis.totalVolume.toString())}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              100% poisha exact
            </span>
            <span className="text-xs text-muted-foreground">pending ledger</span>
          </div>
        </div>
      </div>

      {/* Card 3: Pending Income */}
      <div className="bg-card rounded-[14px] border border-border p-5   flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Income
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
            {kpis.donationCount + kpis.collectionCount}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {formatCurrency(kpis.donationVolume.toString())}
            </span>
            <span className="text-xs text-muted-foreground">donations & boxes</span>
          </div>
        </div>
      </div>

      {/* Card 4: Pending Expenses */}
      <div className="bg-card rounded-[14px] border border-border p-5   flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
            {kpis.expenseCount}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {formatCurrency(kpis.expenseVolume.toString())}
            </span>
            <span className="text-xs text-muted-foreground">treasurer signoff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

