"use client";

import * as React from "react";
import { PieChart, Landmark, Users, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  ReportTab,
  DonorGroupBy,
  DonorStatus,
} from "./types";
import { useIncomeExpenseReport } from "./hooks/use-income-expense-report";
import { useBalancesReport } from "./hooks/use-balances-report";
import { useDonorsReport } from "./hooks/use-donors-report";
import { useReportExport } from "./hooks/use-report-export";
import { useClosePeriod } from "./hooks/use-close-period";
import { useReopenPeriod } from "./hooks/use-reopen-period";
import { ReportsHeader } from "./components/reports-header";
import { OfficialLetterhead } from "./components/official-letterhead";
import { ReportSignatories } from "./components/report-signatories";
import { SummaryView } from "./components/summary-view";
import { BalancesView } from "./components/balances-view";
import { DonorsView } from "./components/donors-view";
import { PeriodLockView } from "./components/period-lock-view";
import { ReopenPeriodDialog } from "./reopen-period-dialog";

type DatePreset = "this-month" | "last-month" | "this-year" | "custom";

interface ReportsPageProps {
  mosqueId: string;
}

export function ReportsPage({ mosqueId }: ReportsPageProps) {
  const { canAccess } = useMosque();
  const canManageFinances = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Tab State: default to "summary"
  const [activeTab, setActiveTab] = React.useState<ReportTab>("summary");

  // View Mode: Executive Dashboard vs Official Statement
  const [isOfficialMode, setIsOfficialMode] = React.useState(false);

  // Date Preset State: default to "this-month"
  const [datePreset, setDatePreset] = React.useState<DatePreset>("this-month");

  // Calculate default dates for "this-month"
  const now = React.useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const getMonthDateRange = React.useCallback((year: number, monthIndex: number) => {
    const start = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const end = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { start, end };
  }, []);

  const defaultMonthRange = React.useMemo(() => {
    return getMonthDateRange(currentYear, currentMonth);
  }, [currentYear, currentMonth, getMonthDateRange]);

  const [startDate, setStartDate] = React.useState(defaultMonthRange.start);
  const [endDate, setEndDate] = React.useState(defaultMonthRange.end);

  // Previous month range (for vs-last-month calculation)
  const lastMonthRange = React.useMemo(() => {
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    return getMonthDateRange(prevDate.getFullYear(), prevDate.getMonth());
  }, [currentYear, currentMonth, getMonthDateRange]);

  // Handle Preset Change
  const handlePresetSelect = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset === "this-month") {
      const range = getMonthDateRange(currentYear, currentMonth);
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === "last-month") {
      const range = lastMonthRange;
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === "this-year") {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(`${currentYear}-12-31`);
    }
  };

  // Donors query states
  const [donorGroupBy, setDonorGroupBy] = React.useState<DonorGroupBy>("member");
  const [donorStatus, setDonorStatus] = React.useState<DonorStatus>("top");

  // Accounting Period States
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const [targetPeriod, setTargetPeriod] = React.useState(currentMonthStr);
  const [isReopenModalOpen, setIsReopenModalOpen] = React.useState(false);

  // Queries
  const { data: incExpData, isLoading: isIncExpLoading } = useIncomeExpenseReport(
    mosqueId,
    startDate,
    endDate,
    "category",
    activeTab === "summary"
  );

  // Query last month data for comparison
  const { data: lastMonthData } = useIncomeExpenseReport(
    mosqueId,
    lastMonthRange.start,
    lastMonthRange.end,
    "category",
    datePreset === "this-month"
  );

  const { data: balancesData, isLoading: isBalancesLoading } = useBalancesReport(
    mosqueId,
    activeTab === "balances"
  );

  const { data: donorsData, isLoading: isDonorsLoading } = useDonorsReport(
    mosqueId,
    startDate,
    endDate,
    donorGroupBy,
    donorStatus,
    activeTab === "donors"
  );

  // Mutations
  const exportMutation = useReportExport(mosqueId);
  const closePeriodMutation = useClosePeriod(mosqueId);
  const reopenPeriodMutation = useReopenPeriod(mosqueId, () => {
    setIsReopenModalOpen(false);
  });

  const handleExportCsv = () => {
    let reportType: "INCOME_EXPENSE" | "BALANCES" | "DONORS" = "INCOME_EXPENSE";
    if (activeTab === "balances") {
      reportType = "BALANCES";
    } else if (activeTab === "donors") {
      reportType = "DONORS";
    }

    exportMutation.mutate({
      reportType,
      format: "CSV",
      startDate,
      endDate,
      groupBy: "category",
      donorGroupBy,
      donorStatus,
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleClosePeriod = () => {
    if (
      confirm(
        `Are you sure you want to close and lock the accounting period for ${targetPeriod}? Once locked, entries within this period become immutable.`
      )
    ) {
      closePeriodMutation.mutate(targetPeriod);
    }
  };

  const handleConfirmReopen = (reason: string) => {
    reopenPeriodMutation.mutate({
      period: targetPeriod,
      reason,
    });
  };

  // Headline Calculations
  const totalIncomeVal = incExpData?.totalIncome || "0";
  const totalExpenseVal = incExpData?.totalExpense || incExpData?.totalExpenses || "0";
  const netSurplusVal = incExpData?.netSurplus || incExpData?.netSavings || "0";
  const isNetPositive = !netSurplusVal.startsWith("-");

  // Comparisons vs Last Month
  const incomeDelta = React.useMemo(() => {
    if (!lastMonthData || datePreset !== "this-month") return null;
    const current = BigInt(totalIncomeVal);
    const prev = BigInt(lastMonthData.totalIncome || "0");
    if (prev === 0n) {
      return { text: "৳0 last month", isPositive: true };
    }
    const pct = Math.round(Number(((current - prev) * 100n) / prev));
    return {
      text: `${pct >= 0 ? "+" : ""}${pct}% vs last month`,
      isPositive: pct >= 0,
    };
  }, [totalIncomeVal, lastMonthData, datePreset]);

  const expenseDelta = React.useMemo(() => {
    if (!lastMonthData || datePreset !== "this-month") return null;
    const current = BigInt(totalExpenseVal);
    const prev = BigInt(lastMonthData.totalExpense || lastMonthData.totalExpenses || "0");
    if (prev === 0n) {
      return { text: "৳0 last month", isPositive: true };
    }
    const pct = Math.round(Number(((current - prev) * 100n) / prev));
    return {
      text: `${pct >= 0 ? "+" : ""}${pct}% vs last month`,
      isPositive: pct <= 0, // lower expense is favorable
    };
  }, [totalExpenseVal, lastMonthData, datePreset]);

  // Selected period label for description
  const selectedPeriodLabel = React.useMemo(() => {
    if (datePreset === "this-month") {
      return now.toLocaleString("default", { month: "long", year: "numeric" });
    }
    if (datePreset === "last-month") {
      const prev = new Date(currentYear, currentMonth - 1, 1);
      return prev.toLocaleString("default", { month: "long", year: "numeric" });
    }
    if (datePreset === "this-year") {
      return `Year ${currentYear}`;
    }
    return `${startDate} to ${endDate}`;
  }, [datePreset, now, currentYear, currentMonth, startDate, endDate]);

  const statementTitle = React.useMemo(() => {
    if (activeTab === "balances") {
      return "Statement of Financial Position: Assets & Fund Balances (আর্থিক স্থিতি বিবরণী)";
    }
    if (activeTab === "donors") {
      return "Schedule of Benefactors & Donor Giving Register (দাতা ও অনুদান তালিকা)";
    }
    return "Statement of Financial Activities: Receipts & Disbursements (আয় ও ব্যয় বিবরণী)";
  }, [activeTab]);

  const isReconciled = React.useMemo(() => {
    if (!balancesData) return true;
    return (
      BigInt(balancesData.totalAccountsBalance || balancesData.totalAccountBalance || "0") ===
      BigInt(balancesData.totalFundsBalance || balancesData.totalFundBalance || "0")
    );
  }, [balancesData]);

  return (
    <div className="  space-y-6">
      {/* 1. Header (Answers ONE plain user question + Primary action) */}
      <ReportsHeader
        onExportCsv={handleExportCsv}
        onPrintPdf={handlePrintPdf}
        isExporting={exportMutation.isPending}
        selectedPeriodLabel={selectedPeriodLabel}
        isOfficialMode={isOfficialMode}
        onToggleOfficialMode={setIsOfficialMode}
      />

      {/* Official Institutional Letterhead (Shown in Official Mode and always on Print) */}
      <div className={isOfficialMode ? "block" : "hidden print:block"}>
        <OfficialLetterhead
          title={statementTitle}
          periodLabel={selectedPeriodLabel}
          isReconciled={isReconciled}
        />
      </div>

      {/* 2. Preset Filter Chips (Default: This month) */}
      <div className="space-y-3 print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handlePresetSelect("this-month")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0",
              datePreset === "this-month"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            )}
          >
            This month
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect("last-month")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0",
              datePreset === "last-month"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            )}
          >
            Last month
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect("this-year")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0",
              datePreset === "this-year"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            )}
          >
            This year
          </button>

          <button
            type="button"
            onClick={() => handlePresetSelect("custom")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0",
              datePreset === "custom"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
            )}
          >
            <span>Custom range</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </div>

        {/* Custom Range Date Pickers (Shown only when Custom is active) */}
        {datePreset === "custom" && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-card rounded-md border border-border text-xs shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                From:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                To:
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Exactly 3 Headline Numbers (Money in, Money out, Left over) */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-3 gap-4",
          isOfficialMode ? "hidden" : "print:hidden"
        )}
      >
        {/* Money in */}
        <div className="bg-card p-4 sm:p-5 rounded-lg border border-border shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Money in
            </span>
            {incomeDelta && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
                  incomeDelta.isPositive
                    ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300"
                )}
              >
                {incomeDelta.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {incomeDelta.text}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono tabular-nums">
              {formatCurrency(totalIncomeVal, { showDecimals: false })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Donations & Jummah collections
          </p>
        </div>

        {/* Money out */}
        <div className="bg-card p-4 sm:p-5 rounded-lg border border-border shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Money out
            </span>
            {expenseDelta && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {expenseDelta.text}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono tabular-nums">
              {formatCurrency(totalExpenseVal, { showDecimals: false })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Salaries, utilities & operations
          </p>
        </div>

        {/* Left over */}
        <div
          className={cn(
            "bg-card p-4 sm:p-5 rounded-lg border shadow-xs transition-all",
            isNetPositive
              ? "border-emerald-300/80 bg-linear-to-br from-card to-emerald-50/20 dark:to-emerald-950/20"
              : "border-rose-300/80 bg-linear-to-br from-card to-rose-50/20 dark:to-rose-950/20"
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isNetPositive
                  ? "text-emerald-800 dark:text-emerald-400"
                  : "text-rose-800 dark:text-rose-400"
              )}
            >
              Left over
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
                isNetPositive
                  ? "text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-rose-700 bg-rose-100/70 dark:bg-rose-950/60 dark:text-rose-300"
              )}
            >
              {isNetPositive ? "Surplus" : "Deficit"}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl sm:text-3xl font-extrabold tracking-tight font-mono tabular-nums",
                isNetPositive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400"
              )}
            >
              {formatCurrency(netSurplusVal, { showDecimals: false })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Money in minus money out
          </p>
        </div>
      </div>

      {/* 4. Tabs (Summary / Balances / Donors) */}
      <div className="border-b border-border print:hidden">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={cn(
              "pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2",
              activeTab === "summary" || activeTab === "income-expense"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <PieChart className="w-4 h-4" />
            <span>Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("balances")}
            className={cn(
              "pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2",
              activeTab === "balances"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Landmark className="w-4 h-4" />
            <span>Balances</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("donors")}
            className={cn(
              "pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2",
              activeTab === "donors"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Donors</span>
          </button>
        </div>
      </div>

      {/* 5. Tab Content */}
      {/* Tab 1: Summary ("Where money came from" & "Where money went" bar lists) */}
      {(activeTab === "summary" || activeTab === "income-expense") && (
        <SummaryView
          data={incExpData}
          isLoading={isIncExpLoading}
          startDate={startDate}
          endDate={endDate}
          isOfficialMode={isOfficialMode}
        />
      )}

      {/* Tab 2: Balances */}
      {activeTab === "balances" && (
        <BalancesView
          data={balancesData}
          isLoading={isBalancesLoading}
        />
      )}

      {/* Tab 3: Donors */}
      {activeTab === "donors" && (
        <DonorsView
          donorGroupBy={donorGroupBy}
          donorStatus={donorStatus}
          onDonorGroupByChange={setDonorGroupBy}
          onDonorStatusChange={setDonorStatus}
          data={donorsData}
          isLoading={isDonorsLoading}
        />
      )}

      {/* 6. Month Locking (Moved to quiet bottom action for Admin/Treasurer) */}
      {canManageFinances && (
        <div className="print:hidden">
          <PeriodLockView
            targetPeriod={targetPeriod}
            onTargetPeriodChange={setTargetPeriod}
            onClosePeriod={handleClosePeriod}
            onOpenReopenModal={() => setIsReopenModalOpen(true)}
            isClosing={closePeriodMutation.isPending}
          />
        </div>
      )}

      {/* Reopen Period Modal */}
      <ReopenPeriodDialog
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        targetPeriod={targetPeriod}
        onConfirm={handleConfirmReopen}
        isPending={reopenPeriodMutation.isPending}
      />
    </div>
  );
}
