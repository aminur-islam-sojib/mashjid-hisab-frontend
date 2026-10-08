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

interface DashboardAccountItem {
  id: string;
  name: string;
  type: string;
  balance: string;
  formattedBalance?: string;
}

interface DashboardFundItem {
  id: string;
  name: string;
  type: string;
  isRestricted: boolean;
  balance: string;
  formattedBalance?: string;
}

interface DashboardReportData {
  asOf: string;
  currentPeriod: string;
  balances?: {
    totalAccounts: string;
    formattedTotalAccounts?: string;
    totalFunds: string;
    formattedTotalFunds?: string;
    accounts: DashboardAccountItem[];
    funds: DashboardFundItem[];
  };
  thisMonth?: {
    period: string;
    startDate: string;
    endDate: string;
    income: string;
    formattedIncome?: string;
    expense: string;
    formattedExpense?: string;
    netSurplus: string;
    formattedNetSurplus?: string;
  };
  pendingApprovals?: {
    pendingDonations: number;
    pendingExpenses: number;
    openCollections: number;
    totalPending: number;
  };
  duesCollection?: {
    period: string;
    totalExpected: string;
    formattedTotalExpected?: string;
    totalCollected: string;
    formattedTotalCollected?: string;
    collectionRatePercentage: number;
    counts: {
      UNPAID: number;
      PARTIAL: number;
      PAID: number;
      WAIVED: number;
      TOTAL: number;
    };
  };
}

export default function MosqueDashboardPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const { activeMosque, canAccess } = useMosque();

  const isOversight = canAccess(["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"]);

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery<DashboardReportData>({
    queryKey: ["mosque", mosqueId, "dashboard-report"],
    queryFn: () => apiClient.get<DashboardReportData>(`/mosques/${mosqueId}/reports/dashboard`),
    enabled: !!mosqueId && isOversight,
  });

  return (
    <div className="space-y-6">
      {/* 1. Welcome Greeting Banner */}
      <WelcomeBanner mosqueName={activeMosque?.name} />

      {/* 2. Loading / Error / KPI Section */}
      {!isOversight ? (
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto">
            <Coins className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Welcome to {activeMosque?.name || "the Mosque"}</h2>
          <p className="text-xs text-muted-foreground">
            You are signed in as a community member. View your contribution history, active pledges, and public financial transparency.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href={`/mosques/${mosqueId}/me`}>
              <Button size="sm">My Giving Portal</Button>
            </Link>
            <Link href={`/mosques/${mosqueId}/donations`}>
              <Button variant="outline" size="sm">Make a Donation</Button>
            </Link>
            {activeMosque?.slug && (
              <Link href={`/m/${activeMosque.slug}`}>
                <Button variant="outline" size="sm">Public Transparency</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : isLoading ? (
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
            totalBalance={dashboardData?.balances?.totalAccounts || "0"}
            monthlyIncome={dashboardData?.thisMonth?.income || "0"}
            monthlyExpense={dashboardData?.thisMonth?.expense || "0"}
            pendingCount={dashboardData?.pendingApprovals?.totalPending || 0}
            pendingAmount="0"
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
                {dashboardData?.balances?.accounts && dashboardData.balances.accounts.length > 0 ? (
                  dashboardData.balances.accounts.map((acc) => (
                    <div key={acc.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{acc.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{acc.type.toLowerCase().replace("_", " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-heading text-foreground">{formatCurrency(acc.balance)}</p>
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
                {dashboardData?.balances?.funds && dashboardData.balances.funds.length > 0 ? (
                  dashboardData.balances.funds.map((fund) => (
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
                        <p className="font-bold font-heading text-foreground">{formatCurrency(fund.balance)}</p>
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

