"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  Receipt,
  Landmark,
  PiggyBank,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { OVERSIGHT_ROLES } from "@/lib/roles";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PrayerTimesCard } from "@/components/dashboard/prayer-times-card";
import { DonationsChartCard } from "@/components/dashboard/donations-chart-card";
import { RecentMembersCard } from "@/components/dashboard/recent-members-card";
import { FacilityUsageCard } from "@/components/dashboard/facility-usage-card";
import { QuickStatsCard } from "@/components/dashboard/quick-stats-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AllocateDialog } from "@/features/funds/components/allocate-dialog";

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

interface DashboardMemberItem {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
  role: string;
}

interface DashboardDonationPoint {
  day: number;
  label: string;
  date: string;
  amount: string;
  formattedAmount: string;
}

interface DashboardFundAllocationItem {
  id: string;
  name: string;
  type: string;
  isRestricted: boolean;
  balance: string;
  formattedBalance: string;
  percentage: number;
}

interface DashboardCampaignItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  targetAmount: string | null;
  formattedTargetAmount: string | null;
  raisedAmount: string;
  formattedRaisedAmount: string;
}

interface DashboardQuickStats {
  boxCollectionsCount: number;
  boxCollectionsTotal: string;
  formattedBoxCollectionsTotal: string;
  activeDonorsCount: number;
  activeStaffCount: number;
  activeCampaignsCount: number;
}

interface DashboardReportData {
  asOf: string;
  currentPeriod: string;
  kpi?: {
    totalMembers: number;
    membersTrendPercentage: number;
    monthlyIncome: string;
    formattedMonthlyIncome: string;
    incomeTrendPercentage: number;
    upcomingEventsCount: number;
    totalFacilitiesCount: number;
  };
  donationsTrend?: {
    currentMonthIncome: string;
    formattedCurrentMonthIncome: string;
    currentMonthLabel?: string;
    lastMonthIncome: string;
    formattedLastMonthIncome: string;
    lastMonthLabel?: string;
    trendPercentage: number;
    lastMonthTrendPercentage?: number;
    currentMonthPoints?: DashboardDonationPoint[];
    lastMonthPoints?: DashboardDonationPoint[];
    dataPoints: DashboardDonationPoint[];
  };
  recentMembers?: DashboardMemberItem[];
  fundAllocation?: {
    totalBalance: string;
    formattedTotalBalance: string;
    overallAllocationPercentage: number;
    funds: DashboardFundAllocationItem[];
  };
  upcomingEvents?: DashboardCampaignItem[];
  quickStats?: DashboardQuickStats;
  balances?: {
    totalAccounts: string;
    formattedTotalAccounts?: string;
    totalFunds: string;
    formattedTotalFunds?: string;
    unallocated?: string;
    formattedUnallocated?: string;
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
    countingSessionsToVerify?: number;
    totalPending: number;
    totalPendingAmount?: string;
    formattedTotalPendingAmount?: string;
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

  const isOversight = canAccess(OVERSIGHT_ROLES);
  const [isAllocateOpen, setIsAllocateOpen] = React.useState(false);

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
      {/* Non-oversight view (Community Member portal) */}
      {!isOversight ? (
        <div className="space-y-6">
          <WelcomeBanner mosqueName={activeMosque?.name} />
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
        </div>
      ) : isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Aggregating mosque dashboard data...</p>
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
          {/* Main Dashboard Layout: Left Content Column + Right Aside Column */}
          <div className="flex flex-col xl:flex-row items-start gap-5">
            {/* Main Column */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
              {/* 1. Welcome Greeting Banner */}
              <WelcomeBanner mosqueName={activeMosque?.name} />

              {/* 2. 4-Card Executive KPI Grid (Connected to Live Database Data) */}
              <KpiCards
                totalMembers={dashboardData?.kpi?.totalMembers ?? 0}
                memberTrendPercentage={dashboardData?.kpi?.membersTrendPercentage ?? 0}
                monthlyIncome={dashboardData?.kpi?.monthlyIncome ?? dashboardData?.thisMonth?.income ?? "0"}
                incomeTrendPercentage={dashboardData?.kpi?.incomeTrendPercentage ?? 0}
                upcomingEventsCount={dashboardData?.kpi?.upcomingEventsCount ?? 0}
                totalFacilitiesCount={dashboardData?.kpi?.totalFacilitiesCount ?? (dashboardData?.balances?.accounts?.length ?? 0) + (dashboardData?.balances?.funds?.length ?? 0)}
                mosqueId={mosqueId}
              />

              {/* Attention Strip: Pending Approvals & Box Count Sessions */}
              {((dashboardData?.pendingApprovals?.totalPending || 0) > 0 ||
                (dashboardData?.pendingApprovals?.countingSessionsToVerify || 0) > 0) && (
                <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800 rounded-xl p-4 space-y-3 shadow-xs">
                  {/* Item 1: Pending Transactions */}
                  {(dashboardData?.pendingApprovals?.totalPending || 0) > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                            {dashboardData?.pendingApprovals?.totalPending} Transaction{dashboardData?.pendingApprovals?.totalPending === 1 ? "" : "s"} Awaiting Approval
                          </h4>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                            {dashboardData?.pendingApprovals?.pendingDonations || 0} donation{(dashboardData?.pendingApprovals?.pendingDonations || 0) === 1 ? "" : "s"}, {dashboardData?.pendingApprovals?.pendingExpenses || 0} expense{(dashboardData?.pendingApprovals?.pendingExpenses || 0) === 1 ? "" : "s"}
                            {dashboardData?.pendingApprovals?.totalPendingAmount && dashboardData.pendingApprovals.totalPendingAmount !== "0" ? ` totaling ${formatCurrency(dashboardData.pendingApprovals.totalPendingAmount)}` : ""}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/mosques/${mosqueId}/transactions?tab=pending`}
                        className="shrink-0 self-end sm:self-center"
                      >
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-8">
                          Review Pending Queue
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Item 2: Box Counting Sessions to Verify */}
                  {(dashboardData?.pendingApprovals?.countingSessionsToVerify || 0) > 0 && (
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${(dashboardData?.pendingApprovals?.totalPending || 0) > 0 ? "pt-3 border-t border-amber-200/60 dark:border-amber-800/60" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Receipt className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                            {dashboardData?.pendingApprovals?.countingSessionsToVerify} Box Count{dashboardData?.pendingApprovals?.countingSessionsToVerify === 1 ? "" : "s"} to Verify
                          </h4>
                          <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                            Counting session{dashboardData?.pendingApprovals?.countingSessionsToVerify === 1 ? "" : "s"} awaiting verification before posting to ledger.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/mosques/${mosqueId}/collections`}
                        className="shrink-0 self-end sm:self-center"
                      >
                        <Button size="sm" variant="outline" className="border-teal-600 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:border-teal-400 text-xs h-8">
                          Verify Box Counts
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Row of 2 Cards: Prayer Times + Live Monthly Donations Curve */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-3.5">
                <PrayerTimesCard mosqueName={activeMosque?.name} />
                <DonationsChartCard
                  monthlyIncome={dashboardData?.donationsTrend?.currentMonthIncome ?? dashboardData?.thisMonth?.income ?? "0"}
                  lastMonthIncome={dashboardData?.donationsTrend?.lastMonthIncome ?? "0"}
                  currentMonthLabel={dashboardData?.donationsTrend?.currentMonthLabel}
                  lastMonthLabel={dashboardData?.donationsTrend?.lastMonthLabel}
                  trendPercentage={dashboardData?.donationsTrend?.trendPercentage ?? 0}
                  lastMonthTrendPercentage={dashboardData?.donationsTrend?.lastMonthTrendPercentage ?? 0}
                  currentMonthPoints={dashboardData?.donationsTrend?.currentMonthPoints ?? dashboardData?.donationsTrend?.dataPoints ?? []}
                  lastMonthPoints={dashboardData?.donationsTrend?.lastMonthPoints ?? []}
                />
              </div>

              {/* 4. Row of 3 Cards: Live Recent Members + Fund Allocation + Operational Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_0.75fr] gap-3">
                <RecentMembersCard
                  members={dashboardData?.recentMembers ?? []}
                  mosqueId={mosqueId}
                />
                <FacilityUsageCard
                  fundAllocation={dashboardData?.fundAllocation}
                  mosqueId={mosqueId}
                />
                <QuickStatsCard
                  stats={dashboardData?.quickStats}
                />
              </div>
            </div>

            {/* Right Aside Column: Quick Actions + Live Upcoming Events */}
            <aside className="w-full xl:w-[283px] shrink-0 flex flex-col gap-4">
              <QuickActionsCard mosqueId={mosqueId} />
              <UpcomingEventsCard
                events={dashboardData?.upcomingEvents ?? []}
                mosqueId={mosqueId}
              />
            </aside>
          </div>

          {/* 5. Treasury Balance Sheet: Physical Accounts & Accounting Funds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
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

                {/* Unallocated Money Row (Visible only when non-zero) */}
                {dashboardData?.balances?.unallocated &&
                  dashboardData.balances.unallocated !== "0" && (
                    <div className="py-3 px-3 -mx-3 mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-amber-900 dark:text-amber-200">Unallocated Balance</p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                            Action Required
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Account balances exceed assigned funds by this amount.
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p className="font-bold font-heading text-amber-900 dark:text-amber-200">
                          {formatCurrency(dashboardData.balances.unallocated)}
                        </p>
                        <Button
                          size="sm"
                          className="h-7 text-[11px] px-2.5 bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => setIsAllocateOpen(true)}
                        >
                          Allocate
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          </div>

          <AllocateDialog
            isOpen={isAllocateOpen}
            onClose={() => setIsAllocateOpen(false)}
            mosqueId={mosqueId}
            unallocatedPoisha={dashboardData?.balances?.unallocated || "0"}
            onSuccess={() => refetch()}
          />
        </>
      )}
    </div>
  );
}
