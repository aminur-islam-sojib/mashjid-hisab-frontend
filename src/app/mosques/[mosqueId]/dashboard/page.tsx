"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  TrendingDown,
  ArrowLeftRight,
  Receipt,
  FileText,
  Landmark,
  PiggyBank,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardReportData {
  accountsSummary: Array<{
    id: string;
    name: string;
    type: string;
    currentBalance: string;
    openingBalance: string;
  }>;
  fundsSummary: Array<{
    id: string;
    name: string;
    type: string;
    isRestricted: boolean;
    currentBalance: string;
  }>;
  totalAccountsBalance: string;
  currentMonthSummary: {
    totalIncome: string;
    totalExpense: string;
    net: string;
  };
  pendingApprovals: {
    count: number;
    totalAmount: string;
  };
  duesSummary: {
    totalExpected: string;
    totalCollected: string;
    outstanding: string;
  };
}

export default function MosqueDashboardPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const { activeMosque, canAccess } = useMosque();

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery<DashboardReportData>({
    queryKey: ["mosque", mosqueId, "dashboard-report"],
    queryFn: () => apiClient.get<DashboardReportData>(`/mosques/${mosqueId}/reports/dashboard`),
    enabled: !!mosqueId,
  });

  return (
    <div className="space-y-6">
      {/* 1. Welcome Greeting Banner */}
      <WelcomeBanner mosqueName={activeMosque?.name} />

      {/* 2. Loading / Error / KPI Section */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Aggregating treasury data...</p>
        </div>
      ) : isError ? (
        <Card className="p-6 border-destructive/20 bg-destructive/5 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm font-semibold text-destructive">Failed to load dashboard report</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : (
        <>
          {/* Executive KPI Cards */}
          <KpiCards
            totalBalance={dashboardData?.totalAccountsBalance}
            monthlyIncome={dashboardData?.currentMonthSummary.totalIncome}
            monthlyExpense={dashboardData?.currentMonthSummary.totalExpense}
            pendingCount={dashboardData?.pendingApprovals.count}
            pendingAmount={dashboardData?.pendingApprovals.totalAmount}
            mosqueId={mosqueId}
          />

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href={`/mosques/${mosqueId}/donations`}>
              <Card className="p-4 hover:border-primary/40 transition-all hover:bg-secondary/20 flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Record Donation</p>
                  <p className="text-[10px] text-muted-foreground truncate">Income ledger</p>
                </div>
              </Card>
            </Link>

            <Link href={`/mosques/${mosqueId}/expenses`}>
              <Card className="p-4 hover:border-primary/40 transition-all hover:bg-secondary/20 flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Record Expense</p>
                  <p className="text-[10px] text-muted-foreground truncate">Disbursements</p>
                </div>
              </Card>
            </Link>

            <Link href={`/mosques/${mosqueId}/transfers`}>
              <Card className="p-4 hover:border-primary/40 transition-all hover:bg-secondary/20 flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Transfer Funds</p>
                  <p className="text-[10px] text-muted-foreground truncate">Bank & accounts</p>
                </div>
              </Card>
            </Link>

            <Link href={`/mosques/${mosqueId}/collections`}>
              <Card className="p-4 hover:border-primary/40 transition-all hover:bg-secondary/20 flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">Box Counting</p>
                  <p className="text-[10px] text-muted-foreground truncate">Jummah collection</p>
                </div>
              </Card>
            </Link>
          </div>

          {/* Treasury Overview Grid: Accounts & Funds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts Balance Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-heading text-foreground">
                      Physical Accounts
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Cash & bank accounts in custody</p>
                  </div>
                </div>
                <Link
                  href={`/mosques/${mosqueId}/accounts`}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-border/60 mt-2">
                {dashboardData?.accountsSummary && dashboardData.accountsSummary.length > 0 ? (
                  dashboardData.accountsSummary.map((acc) => (
                    <div key={acc.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{acc.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{acc.type.toLowerCase().replace("_", " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-heading text-foreground">{formatCurrency(acc.currentBalance)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center">No accounts created yet.</p>
                )}
              </div>
            </Card>

            {/* Accounting Funds Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-heading text-foreground">
                      Accounting Funds
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Restricted & general funds allocation</p>
                  </div>
                </div>
                <Link
                  href={`/mosques/${mosqueId}/funds`}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-border/60 mt-2">
                {dashboardData?.fundsSummary && dashboardData.fundsSummary.length > 0 ? (
                  dashboardData.fundsSummary.map((fund) => (
                    <div key={fund.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground">{fund.name}</p>
                          {fund.isRestricted && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                              Restricted
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground capitalize">{fund.type.toLowerCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-heading text-foreground">{formatCurrency(fund.currentBalance)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center">No funds created yet.</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

