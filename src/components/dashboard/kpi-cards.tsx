"use client";

import * as React from "react";
import Link from "next/link";
import { Landmark, TrendingUp, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/money";

export interface DashboardKpiProps {
  totalTreasuryBalance?: string | bigint;
  accountsCount?: number;
  unallocatedBalance?: string | bigint;
  asOfDate?: string | Date;

  monthlyIncome?: string | bigint;
  incomeTrendPercentage?: number;
  currentMonthLabel?: string;

  monthlyExpense?: string | bigint;
  expenseTrendPercentage?: number;

  pendingApprovalsCount?: number;
  pendingApprovalsAmount?: string | bigint;
  pendingDonationsCount?: number;
  pendingExpensesCount?: number;

  mosqueId?: string;

  // Legacy props kept for backward-compatibility
  totalMembers?: number;
  memberTrendPercentage?: number;
  upcomingEventsCount?: number;
  totalFacilitiesCount?: number;
}

export function KpiCards({
  totalTreasuryBalance = "0",
  accountsCount = 0,
  unallocatedBalance = "0",
  asOfDate,
  monthlyIncome = "0",
  incomeTrendPercentage = 0,
  currentMonthLabel,
  monthlyExpense = "0",
  expenseTrendPercentage = 0,
  pendingApprovalsCount = 0,
  pendingApprovalsAmount = "0",
  pendingDonationsCount = 0,
  pendingExpensesCount = 0,
  mosqueId,
}: DashboardKpiProps) {
  const formattedTreasury = React.useMemo(() => {
    return formatCurrency(totalTreasuryBalance || "0", { showDecimals: false });
  }, [totalTreasuryBalance]);

  const formattedIncome = React.useMemo(() => {
    return formatCurrency(monthlyIncome || "0", { showDecimals: false });
  }, [monthlyIncome]);

  const formattedExpense = React.useMemo(() => {
    return formatCurrency(monthlyExpense || "0", { showDecimals: false });
  }, [monthlyExpense]);

  const formattedAsOf = React.useMemo(() => {
    if (!asOfDate) {
      return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    const d = new Date(asOfDate);
    return isNaN(d.getTime())
      ? "Today"
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [asOfDate]);

  const renderTrend = (pct: number) => {
    if (pct > 0) {
      return (
        <span className="text-[11px] font-semibold text-[#0B8A63] align-middle font-sans">
          ▲ +{pct}%
        </span>
      );
    }
    if (pct < 0) {
      return (
        <span className="text-[11px] font-semibold text-rose-600 align-middle font-sans">
          ▼ {pct}%
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-[#5E766E] dark:text-muted-foreground align-middle font-sans">
        — 0%
      </span>
    );
  };

  const renderExpenseTrend = (pct: number) => {
    if (pct > 0) {
      return (
        <span className="text-[11px] font-semibold text-rose-600 align-middle font-sans" title="Higher spending vs last month">
          ▲ +{pct}%
        </span>
      );
    }
    if (pct < 0) {
      return (
        <span className="text-[11px] font-semibold text-[#0B8A63] align-middle font-sans" title="Lower spending vs last month">
          ▼ {pct}%
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-[#5E766E] dark:text-muted-foreground align-middle font-sans">
        — 0%
      </span>
    );
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Treasury Balance */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-[14px] p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-35">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground font-medium truncate">Total treasury balance</div>
            <div className="text-[26px] font-bold text-foreground leading-tight mt-0.5 font-mono tabular-nums">
              {formattedTreasury}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          <span>
            {unallocatedBalance && unallocatedBalance !== "0"
              ? `৳${formatCurrency(unallocatedBalance, { showDecimals: false })} unallocated`
              : `As of ${formattedAsOf}${accountsCount > 0 ? ` • ${accountsCount} accts` : ""}`}
          </span>
          <Link
            href={mosqueId ? `/mosques/${mosqueId}/accounts` : "#"}
            className="hover:text-primary transition-colors shrink-0 ml-1"
          >
            Accounts →
          </Link>
        </div>
      </div>

      {/* 2. Income this month */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-[14px] p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-35">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground font-medium truncate">Income this month</div>
            <div className="text-[26px] font-bold text-foreground leading-tight mt-0.5 font-mono tabular-nums">
              {formattedIncome}{" "}
              {renderTrend(incomeTrendPercentage)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          <span>{currentMonthLabel ? `${currentMonthLabel} collections` : "This month's collection"}</span>
          <Link
            href={mosqueId ? `/mosques/${mosqueId}/donations` : "#"}
            className="hover:text-primary transition-colors shrink-0 ml-1"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* 3. Spending this month */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-[14px] p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-35">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground font-medium truncate">Spending this month</div>
            <div className="text-[26px] font-bold text-foreground leading-tight mt-0.5 font-mono tabular-nums">
              {formattedExpense}{" "}
              {renderExpenseTrend(expenseTrendPercentage)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          <span>{currentMonthLabel ? `${currentMonthLabel} payouts` : "Approved payouts"}</span>
          <Link
            href={mosqueId ? `/mosques/${mosqueId}/expenses` : "#"}
            className="hover:text-primary transition-colors shrink-0 ml-1"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* 4. Pending approvals */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-[14px] p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-35">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${pendingApprovalsCount > 0
            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
            : "bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400"
            }`}>
            {pendingApprovalsCount > 0 ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-foreground font-medium truncate">Pending approvals</div>
            <div className="flex items-baseline justify-between gap-1 mt-0.5">
              <span className="text-[26px] font-bold text-foreground leading-tight font-mono tabular-nums">
                {pendingApprovalsCount}
              </span>
              {pendingApprovalsAmount && pendingApprovalsAmount !== "0" && (
                <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400 font-mono truncate">
                  {formatCurrency(pendingApprovalsAmount, { showDecimals: false })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          <span>
            {pendingApprovalsCount > 0
              ? `${pendingDonationsCount} in, ${pendingExpensesCount} out`
              : "All caught up ✓"}
          </span>
          <Link
            href={mosqueId ? `/mosques/${mosqueId}/approvals` : "#"}
            className={`${pendingApprovalsCount > 0 ? "text-amber-700 dark:text-amber-400 font-medium" : "hover:text-primary"} transition-colors shrink-0 ml-1`}
          >
            {pendingApprovalsCount > 0 ? "Review →" : "History →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
