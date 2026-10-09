"use client";

import * as React from "react";
import { PieChart, Landmark, Users, Lock } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";
import { ADMIN_ONLY_ROLES } from "@/lib/roles";
import {
  ReportTab,
  IncomeExpenseGroupBy,
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
import { IncomeExpenseView } from "./components/income-expense-view";
import { BalancesView } from "./components/balances-view";
import { DonorsView } from "./components/donors-view";
import { PeriodLockView } from "./components/period-lock-view";
import { ReopenPeriodDialog } from "./reopen-period-dialog";

interface ReportsPageProps {
  mosqueId: string;
}

export function ReportsPage({ mosqueId }: ReportsPageProps) {
  const { canAccess } = useMosque();

  const [activeTab, setActiveTab] = React.useState<ReportTab>("income-expense");

  // Filter States
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = React.useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = React.useState<IncomeExpenseGroupBy>("category");

  // Donors query states
  const [donorGroupBy, setDonorGroupBy] = React.useState<DonorGroupBy>("member");
  const [donorStatus, setDonorStatus] = React.useState<DonorStatus>("top");

  // Accounting Period States
  const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const [targetPeriod, setTargetPeriod] = React.useState(currentMonthStr);
  const [isReopenModalOpen, setIsReopenModalOpen] = React.useState(false);

  const isAdmin = canAccess(ADMIN_ONLY_ROLES);

  // Queries
  const { data: incExpData, isLoading: isIncExpLoading } = useIncomeExpenseReport(
    mosqueId,
    startDate,
    endDate,
    groupBy,
    activeTab === "income-expense"
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
      groupBy,
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
        `Are you sure you want to close and lock the accounting period for ${targetPeriod}?`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <ReportsHeader
        onExportCsv={handleExportCsv}
        onPrintPdf={handlePrintPdf}
        isExporting={exportMutation.isPending}
      />

      {/* Tabs (Hidden during print) */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg w-fit print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("income-expense")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "income-expense"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Income & Expense</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("balances")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "balances"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("donors")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "donors"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Top Donors</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("periods")}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "periods"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Period Lock</span>
          </button>
        )}
      </div>

      {/* Tab 1: Income & Expense */}
      {activeTab === "income-expense" && (
        <IncomeExpenseView
          startDate={startDate}
          endDate={endDate}
          groupBy={groupBy}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onGroupByChange={setGroupBy}
          data={incExpData}
          isLoading={isIncExpLoading}
        />
      )}

      {/* Tab 2: Balance Sheet */}
      {activeTab === "balances" && (
        <BalancesView
          data={balancesData}
          isLoading={isBalancesLoading}
        />
      )}

      {/* Tab 3: Top Donors */}
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

      {/* Tab 4: Period Lock */}
      {activeTab === "periods" && isAdmin && (
        <PeriodLockView
          targetPeriod={targetPeriod}
          onTargetPeriodChange={setTargetPeriod}
          onClosePeriod={handleClosePeriod}
          onOpenReopenModal={() => setIsReopenModalOpen(true)}
          isClosing={closePeriodMutation.isPending}
        />
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

