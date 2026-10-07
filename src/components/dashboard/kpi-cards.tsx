"use client";

import * as React from "react";
import Link from "next/link";
import { Landmark, TrendingUp, TrendingDown, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/money";

export interface DashboardKpiProps {
  totalBalance?: string | bigint;
  monthlyIncome?: string | bigint;
  monthlyExpense?: string | bigint;
  pendingCount?: number;
  pendingAmount?: string | bigint;
  mosqueId?: string;
}

export function KpiCards({
  totalBalance = "0",
  monthlyIncome = "0",
  monthlyExpense = "0",
  pendingCount = 0,
  pendingAmount = "0",
  mosqueId,
}: DashboardKpiProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {/* 1. Total Treasury Balance */}
      <Card className="p-5 lg:p-6 hover:border-primary/30 transition-all group">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate block">
              Total Treasury Balance
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold font-heading text-foreground truncate">
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/60">
          Combined cash & bank accounts
        </p>
      </Card>

      {/* 2. Monthly Income */}
      <Card className="p-5 lg:p-6 hover:border-emerald-500/30 transition-all group">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate block">
              This Month&apos;s Income
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 truncate">
                {formatCurrency(monthlyIncome)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/60">
          Donations & box collections
        </p>
      </Card>

      {/* 3. Monthly Expense */}
      <Card className="p-5 lg:p-6 hover:border-rose-500/30 transition-all group">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate block">
              This Month&apos;s Spending
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold font-heading text-foreground truncate">
                {formatCurrency(monthlyExpense)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/60">
          Disbursements & maintenance
        </p>
      </Card>

      {/* 4. Pending Approvals Queue */}
      <Card className="p-5 lg:p-6 hover:border-amber-500/30 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate block">
                Pending Approvals
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                  {pendingCount}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  ({formatCurrency(pendingAmount)})
                </span>
              </div>
            </div>
          </div>
          {mosqueId && (
            <Link
              href={`/mosques/${mosqueId}/transactions`}
              className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-0.5 self-center hover:underline shrink-0 pl-1"
            >
              Review
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/60">
          Dual-control approval queue
        </p>
      </Card>
    </div>
  );
}
