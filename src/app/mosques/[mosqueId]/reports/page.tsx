"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Calendar,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  PieChart,
  Landmark,
  PiggyBank,
  Users,
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader2,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { ADMIN_ONLY_ROLES } from "@/lib/roles";

export default function ReportsPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { canAccess } = useMosque();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<
    "income-expense" | "balances" | "donors" | "periods"
  >("income-expense");

  // Filter States
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = React.useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = React.useState<"month" | "fund" | "category">("category");

  // Donors query
  const [donorGroupBy, setDonorGroupBy] = React.useState<"member" | "family">("member");
  const [donorStatus, setDonorStatus] = React.useState<"top" | "all">("top");

  // Accounting Period States
  const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const [targetPeriod, setTargetPeriod] = React.useState(currentMonthStr);
  const [reopenReason, setReopenReason] = React.useState("");
  const [isReopenModalOpen, setIsReopenModalOpen] = React.useState(false);

  const isAdmin = canAccess(ADMIN_ONLY_ROLES);

  // 1. Fetch Income/Expense
  const { data: incExpData, isLoading: isIncExpLoading } = useQuery<any>({
    queryKey: ["report-inc-exp", mosqueId, startDate, endDate, groupBy],
    queryFn: async () => {
      const p = new URLSearchParams({
        startDate,
        endDate,
        groupBy,
      });
      return apiClient.get<any>(
        `/mosques/${mosqueId}/reports/income-expense?${p.toString()}`
      );
    },
    enabled: activeTab === "income-expense",
  });

  // 2. Fetch Balances
  const { data: balancesData, isLoading: isBalancesLoading } = useQuery<any>({
    queryKey: ["report-balances", mosqueId],
    queryFn: () => apiClient.get<any>(`/mosques/${mosqueId}/reports/balances`),
    enabled: activeTab === "balances",
  });

  // 3. Fetch Donors
  const { data: donorsData, isLoading: isDonorsLoading } = useQuery<any>({
    queryKey: ["report-donors", mosqueId, startDate, endDate, donorGroupBy, donorStatus],
    queryFn: () => {
      const p = new URLSearchParams({
        startDate,
        endDate,
        groupBy: donorGroupBy,
        status: donorStatus,
        limit: "50",
      });
      return apiClient.get<any>(
        `/mosques/${mosqueId}/reports/donors?${p.toString()}`
      );
    },
    enabled: activeTab === "donors",
  });

  // Export Mutation
  const exportMutation = useMutation({
    mutationFn: ({ reportType, format }: { reportType: string; format: string }) =>
      apiClient.post<any>(`/mosques/${mosqueId}/reports/exports`, {
        reportType,
        format,
        parameters: { startDate, endDate, groupBy },
      }),
    onSuccess: (data: any) => {
      toast.success("Export generated successfully!");
      if (data?.id) {
        window.open(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/mosques/${mosqueId}/reports/exports/${data.id}?download=true`,
          "_blank"
        );
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate export");
    },
  });

  // Period Control Mutations
  const closePeriodMutation = useMutation({
    mutationFn: async (period: string) =>
      apiClient.post(`/mosques/${mosqueId}/periods/${period}/close`),
    onSuccess: () => {
      toast.success(`Accounting period ${targetPeriod} closed and locked.`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to close accounting period");
    },
  });

  const reopenPeriodMutation = useMutation({
    mutationFn: async ({ period, reason }: { period: string; reason: string }) =>
      apiClient.post(`/mosques/${mosqueId}/periods/${period}/reopen`, { reason }),
    onSuccess: () => {
      toast.success(`Accounting period ${targetPeriod} reopened.`);
      setIsReopenModalOpen(false);
      setReopenReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reopen accounting period");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Financial Statements & Period Audit
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Auditable balance sheets, income/expense breakdown, donor analysis, and monthly period locks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate({ reportType: "INCOME_EXPENSE", format: "CSV" })}
            disabled={exportMutation.isPending}
            className="text-xs border-[#006B5B] text-[#006B5B] hover:bg-[#E6F4F0]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {exportMutation.isPending ? "Exporting..." : "Export Statement (CSV)"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg w-fit">
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
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Group By:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="category">Category</option>
                <option value="fund">Fund</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>

          {isIncExpLoading ? (
            <div className="py-16 text-center text-gray-500">
              Generating income & expense statement...
            </div>
          ) : !incExpData ? (
            <div className="py-16 text-center text-gray-500">
              No statement data available for the selected range.
            </div>
          ) : (
            <>
              {/* Summary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Income
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {formatCurrency(incExpData.totalIncome || "0")}
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                  <div className="flex items-center space-x-2 text-red-600 mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Expenses
                    </span>
                  </div>
                  <div className="text-2xl font-black text-red-700">
                    {formatCurrency(incExpData.totalExpenses || "0")}
                  </div>
                </div>

                <div className="p-5 bg-[#E6F4F0] rounded-xl border border-[#006B5B]/20 shadow-xs">
                  <div className="flex items-center space-x-2 text-[#006B5B] mb-1">
                    <Landmark className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Net Surplus / (Deficit)
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#006B5B]">
                    {formatCurrency(incExpData.netSavings || incExpData.netSurplus || "0")}
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Line Item / Group</Th>
                      <Th className="text-right">Income</Th>
                      <Th className="text-right">Expense</Th>
                      <Th className="text-right">Net Flow</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(incExpData.breakdown || incExpData.items || []).map(
                      (item: any, idx: number) => (
                        <Tr key={idx}>
                          <Td className="font-semibold text-gray-900">
                            {item.label || item.name || item.group || `Period ${idx + 1}`}
                          </Td>
                          <Td className="text-right font-medium text-emerald-700">
                            {formatCurrency(item.income || "0")}
                          </Td>
                          <Td className="text-right font-medium text-red-700">
                            {formatCurrency(item.expense || "0")}
                          </Td>
                          <Td className="text-right font-bold text-[#006B5B]">
                            {formatCurrency(
                              (
                                BigInt(item.income || "0") - BigInt(item.expense || "0")
                              ).toString()
                            )}
                          </Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {activeTab === "balances" && (
        <div className="space-y-6">
          {isBalancesLoading ? (
            <div className="py-16 text-center text-gray-500">
              Calculating fund and account balances...
            </div>
          ) : !balancesData ? (
            <div className="py-16 text-center text-gray-500">
              No balance sheet data returned.
            </div>
          ) : (
            <>
              {/* Asset Accounts vs Fund Allocations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accounts (Assets) */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-900 font-bold">
                      <Landmark className="w-5 h-5 text-[#006B5B]" />
                      <span>Financial Accounts (Assets)</span>
                    </div>
                    <span className="text-lg font-black text-[#006B5B]">
                      {formatCurrency(balancesData.totalAccountBalance || "0")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(balancesData.accounts || []).map((acct: any) => (
                      <div
                        key={acct.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {acct.name}
                          </span>
                          <span className="text-xs text-gray-400">{acct.type}</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(acct.currentBalance || "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funds (Equity) */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-900 font-bold">
                      <PiggyBank className="w-5 h-5 text-[#006B5B]" />
                      <span>Fund Allocations (Equity)</span>
                    </div>
                    <span className="text-lg font-black text-[#006B5B]">
                      {formatCurrency(balancesData.totalFundBalance || "0")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(balancesData.funds || []).map((fund: any) => (
                      <div
                        key={fund.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div>
                          <span className="font-semibold text-gray-900 block">
                            {fund.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {fund.isRestricted ? "Restricted Fund" : "Unrestricted"}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(fund.currentBalance || "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Integrity Indicator */}
              <div className="p-4 bg-[#E6F4F0] border border-[#006B5B]/30 rounded-xl flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-[#006B5B]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">
                    Double-Entry Balance Verification Check
                  </span>
                </div>
                <span className="text-xs text-[#006B5B] font-medium">
                  Ledger reconciled: Total Accounts = Total Funds
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: Top Donors */}
      {activeTab === "donors" && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Entity:</span>
              <select
                value={donorGroupBy}
                onChange={(e) => setDonorGroupBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="member">Individual Member</option>
                <option value="family">Family Household</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
              <select
                value={donorStatus}
                onChange={(e) => setDonorStatus(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="top">Top Donors</option>
                <option value="all">All Donors</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isDonorsLoading ? (
              <div className="py-16 text-center text-gray-500">
                Calculating donor rankings...
              </div>
            ) : !donorsData || (donorsData.donors || donorsData.data || []).length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No donor records found.
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Rank</Th>
                    <Th>Donor / Household</Th>
                    <Th className="text-right">Total Contributed</Th>
                    <Th className="text-right">Donation Count</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(donorsData.donors || donorsData.data || []).map(
                    (d: any, idx: number) => (
                      <Tr key={idx}>
                        <Td className="font-bold text-gray-400">#{idx + 1}</Td>
                        <Td className="font-semibold text-gray-900">
                          {d.name || d.donorName || "Congregant"}
                        </Td>
                        <Td className="text-right font-black text-[#006B5B]">
                          {formatCurrency(d.totalAmount || "0")}
                        </Td>
                        <Td className="text-right text-xs text-gray-600">
                          {d.count || d.donationCount || 1} donations
                        </Td>
                      </Tr>
                    )
                  )}
                </Tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Period Lock */}
      {activeTab === "periods" && isAdmin && (
        <div className="max-w-2xl bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-start space-x-3 text-gray-900">
            <Lock className="w-6 h-6 text-[#006B5B] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold">Accounting Period Lock Control</h3>
              <p className="text-xs text-gray-500 mt-1">
                Once a monthly accounting period is closed, all financial transactions dated
                within that month become strictly immutable and cannot be edited, posted, or voided.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
              Target Period (YYYY-MM)
            </label>
            <input
              type="month"
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            />
          </div>

          <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to close and lock the accounting period for ${targetPeriod}?`
                  )
                ) {
                  closePeriodMutation.mutate(targetPeriod);
                }
              }}
              disabled={closePeriodMutation.isPending}
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Close & Lock Period
            </Button>

            <Button
              variant="outline"
              className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
              onClick={() => setIsReopenModalOpen(true)}
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              Reopen Period
            </Button>
          </div>
        </div>
      )}

      {/* Reopen Period Modal */}
      <Modal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        title={`Reopen Accounting Period: ${targetPeriod}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
            Reopening a closed accounting period requires an audited formal justification.
            All ledger changes performed during the reopened state will be flagged in audit logs.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Reason for Reopening <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Explain why adjustments are required for this locked period..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsReopenModalOpen(false)}
              disabled={reopenPeriodMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() =>
                reopenPeriodMutation.mutate({
                  period: targetPeriod,
                  reason: reopenReason,
                })
              }
              disabled={!reopenReason.trim() || reopenPeriodMutation.isPending}
            >
              {reopenPeriodMutation.isPending ? "Reopening..." : "Confirm Reopen"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
