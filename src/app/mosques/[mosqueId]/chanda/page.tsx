"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarHeart,
  Plus,
  Sparkles,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Calendar,
  CreditCard,
  Ban,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import {
  ChandaPlan,
  DueRecord,
  DuesSummary,
} from "@/features/chanda/types";
import { CreatePlanDialog } from "@/features/chanda/create-plan-dialog";
import { GenerateDuesDialog } from "@/features/chanda/generate-dues-dialog";
import { RecordDuePaymentDialog } from "@/features/chanda/record-due-payment-dialog";
import { WaiveDueDialog } from "@/features/chanda/waive-due-dialog";

export default function ChandaPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { canAccess } = useMosque();
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<"dues" | "plans" | "analytics">("dues");

  const currentMonth = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = React.useState(currentMonth);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [search, setSearch] = React.useState("");

  // Dialog States
  const [isCreatePlanOpen, setIsCreatePlanOpen] = React.useState(false);
  const [isGenerateDuesOpen, setIsGenerateDuesOpen] = React.useState(false);
  const [dueToPay, setDueToPay] = React.useState<DueRecord | null>(null);
  const [dueToWaive, setDueToWaive] = React.useState<DueRecord | null>(null);

  const isAdmin = canAccess(["MOSQUE_ADMIN"]);
  const canManagePlans = canAccess(["MOSQUE_ADMIN", "TREASURER"]);

  // Fetch Dues
  const { data: duesData, isLoading: isDuesLoading } = useQuery<DueRecord[]>({
    queryKey: ["dues", mosqueId, selectedPeriod, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.append("limit", "100");
      if (selectedPeriod) p.append("period", selectedPeriod);
      if (statusFilter) p.append("status", statusFilter);

      return apiClient.get<DueRecord[]>(
        `/mosques/${mosqueId}/dues?${p.toString()}`
      );
    },
    enabled: activeTab === "dues",
  });

  // Fetch Plans
  const { data: plansData, isLoading: isPlansLoading } = useQuery<ChandaPlan[]>({
    queryKey: ["chanda-plans", mosqueId],
    queryFn: () =>
      apiClient.get<ChandaPlan[]>(
        `/mosques/${mosqueId}/chanda-plans?limit=100`
      ),
    enabled: activeTab === "plans",
  });

  // Fetch Summary & Analytics
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery<DuesSummary>({
    queryKey: ["dues-summary", mosqueId, selectedPeriod],
    queryFn: () =>
      apiClient.get<DuesSummary>(
        `/mosques/${mosqueId}/dues/summary?period=${selectedPeriod}`
      ),
    enabled: activeTab === "analytics",
  });

  // Plan Status Mutations (Pause / Resume / End)
  const pausePlanMutation = useMutation({
    mutationFn: async (planId: string) =>
      apiClient.post(`/mosques/${mosqueId}/chanda-plans/${planId}/pause`),
    onSuccess: () => {
      toast.success("Plan paused.");
      queryClient.invalidateQueries({ queryKey: ["chanda-plans", mosqueId] });
    },
  });

  const resumePlanMutation = useMutation({
    mutationFn: async (planId: string) =>
      apiClient.post(`/mosques/${mosqueId}/chanda-plans/${planId}/resume`),
    onSuccess: () => {
      toast.success("Plan resumed.");
      queryClient.invalidateQueries({ queryKey: ["chanda-plans", mosqueId] });
    },
  });

  const endPlanMutation = useMutation({
    mutationFn: async (planId: string) =>
      apiClient.post(`/mosques/${mosqueId}/chanda-plans/${planId}/end`),
    onSuccess: () => {
      toast.success("Plan ended.");
      queryClient.invalidateQueries({ queryKey: ["chanda-plans", mosqueId] });
    },
  });

  const getDueStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "PARTIAL":
        return <Badge variant="warning">Partial</Badge>;
      case "UNPAID":
        return <Badge variant="danger">Unpaid</Badge>;
      case "WAIVED":
        return <Badge variant="secondary">Waived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDues = React.useMemo(() => {
    if (!duesData) return [];
    return duesData.filter((d) => {
      const payerName = d.member?.user?.name || d.family?.name || "";
      return payerName.toLowerCase().includes(search.toLowerCase());
    });
  }, [duesData, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Chanda & Membership Dues
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage recurring subscription pledges, monthly dues generation, and collection tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canManagePlans && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsGenerateDuesOpen(true)}
                className="text-xs border-[#006B5B] text-[#006B5B] hover:bg-[#E6F4F0]"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate Dues
              </Button>
              <Button
                onClick={() => setIsCreatePlanOpen(true)}
                className="text-xs bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Chanda Plan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("dues")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "dues"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Monthly Dues</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "plans"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <CalendarHeart className="w-4 h-4" />
          <span>Recurring Plans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "analytics"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Collection Analytics</span>
        </button>
      </div>

      {/* Tab 1: Monthly Dues */}
      {activeTab === "dues" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search member or family..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              />
            </div>

            <div className="w-full sm:w-44">
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              />
            </div>

            <div className="w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="">All Statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="WAIVED">Waived</option>
              </select>
            </div>
          </div>

          {/* Dues Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isDuesLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading monthly dues...
              </div>
            ) : filteredDues.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No dues found for period {selectedPeriod}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Generate Dues" above to generate monthly invoices from active plans.
                </p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Period</Th>
                    <Th>Payer</Th>
                    <Th>Fund</Th>
                    <Th className="text-right">Invoice Amount</Th>
                    <Th className="text-right">Paid Amount</Th>
                    <Th className="text-right">Remaining</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDues.map((due) => {
                    const remaining =
                      BigInt(due.amount || "0") - BigInt(due.paidAmount || "0");
                    const isPayable =
                      due.status !== "PAID" && due.status !== "WAIVED";

                    return (
                      <Tr key={due.id}>
                        <Td className="whitespace-nowrap font-medium text-gray-700">
                          {due.period}
                        </Td>
                        <Td className="font-medium text-gray-900">
                          {due.member?.user?.name ||
                            (due.family?.name ? `${due.family.name} Household` : "Member")}
                          {due.member?.user?.phone && (
                            <span className="block text-xs text-gray-400 font-normal">
                              {due.member.user.phone}
                            </span>
                          )}
                        </Td>
                        <Td className="text-xs text-gray-600">
                          {due.fund?.name || "General Fund"}
                        </Td>
                        <Td className="text-right font-semibold text-gray-900 whitespace-nowrap">
                          {formatCurrency(due.amount)}
                        </Td>
                        <Td className="text-right font-medium text-emerald-700 whitespace-nowrap">
                          {formatCurrency(due.paidAmount)}
                        </Td>
                        <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                          {formatCurrency(remaining > 0n ? remaining.toString() : "0")}
                        </Td>
                        <Td>{getDueStatusBadge(due.status)}</Td>
                        <Td className="text-right whitespace-nowrap">
                          {isPayable ? (
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                size="sm"
                                className="text-xs bg-[#006B5B] hover:bg-[#005246] text-white"
                                onClick={() => setDueToPay(due)}
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Pay
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs text-amber-700 hover:bg-amber-50"
                                  onClick={() => setDueToWaive(due)}
                                >
                                  Waive
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Settled</span>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Recurring Plans */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isPlansLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading recurring plans...
              </div>
            ) : !plansData || plansData.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <CalendarHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No active Chanda plans</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "New Chanda Plan" to enroll donors in recurring giving.
                </p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Payer Entity</Th>
                    <Th>Fund</Th>
                    <Th className="text-right">Pledged Amount</Th>
                    <Th>Frequency</Th>
                    <Th>Start Month</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {plansData.map((plan) => (
                    <Tr key={plan.id}>
                      <Td className="font-medium text-gray-900">
                        {plan.member?.user?.name ||
                          (plan.family?.name ? `${plan.family.name} Household` : "Member")}
                        {plan.member?.user?.phone && (
                          <span className="block text-xs text-gray-400 font-normal">
                            {plan.member.user.phone}
                          </span>
                        )}
                      </Td>
                      <Td className="text-xs text-gray-600">
                        {plan.fund?.name || "General Fund"}
                      </Td>
                      <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                        {formatCurrency(plan.amount)}
                      </Td>
                      <Td>
                        <Badge variant="outline">{plan.frequency}</Badge>
                      </Td>
                      <Td className="text-xs text-gray-700 font-mono">
                        {plan.startMonth}
                      </Td>
                      <Td>
                        {plan.status === "ACTIVE" ? (
                          <Badge variant="success">Active</Badge>
                        ) : plan.status === "PAUSED" ? (
                          <Badge variant="warning">Paused</Badge>
                        ) : (
                          <Badge variant="secondary">Ended</Badge>
                        )}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        {canManagePlans && plan.status !== "ENDED" && (
                          <div className="flex items-center justify-end space-x-1">
                            {plan.status === "ACTIVE" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-amber-700 hover:bg-amber-50"
                                onClick={() => pausePlanMutation.mutate(plan.id)}
                                disabled={pausePlanMutation.isPending}
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-emerald-700 hover:bg-emerald-50"
                                onClick={() => resumePlanMutation.mutate(plan.id)}
                                disabled={resumePlanMutation.isPending}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Resume
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (confirm("Are you sure you want to end this Chanda plan?")) {
                                  endPlanMutation.mutate(plan.id);
                                }
                              }}
                              disabled={endPlanMutation.isPending}
                            >
                              End
                            </Button>
                          </div>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Collection Analytics & Defaulters */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs">
            <span className="text-sm font-semibold text-gray-700">Analytics Period</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            />
          </div>

          {isSummaryLoading ? (
            <div className="py-16 text-center text-gray-500">
              Loading dues analytics for {selectedPeriod}...
            </div>
          ) : !summaryData ? (
            <div className="py-16 text-center text-gray-500">
              No summary data available for {selectedPeriod}.
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                    Total Expected
                  </span>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(summaryData.totalExpected)}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {summaryData.totalDuesCount} generated invoices
                  </span>
                </div>

                <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
                    Total Collected
                  </span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    {formatCurrency(summaryData.totalCollected)}
                  </div>
                  <span className="text-xs text-emerald-600 font-medium mt-1 block">
                    {summaryData.paidCount} paid in full
                  </span>
                </div>

                <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-red-500 tracking-wider">
                    Outstanding Balance
                  </span>
                  <div className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(summaryData.totalOutstanding)}
                  </div>
                  <span className="text-xs text-red-500 font-medium mt-1 block">
                    {summaryData.unpaidCount + summaryData.partialCount} overdue/partial
                  </span>
                </div>

                <div className="p-5 bg-[#E6F4F0] rounded-xl border border-[#006B5B]/20 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-[#006B5B] tracking-wider">
                    Collection Rate
                  </span>
                  <div className="text-3xl font-black text-[#006B5B] mt-1">
                    {summaryData.collectionRate}%
                  </div>
                  <span className="text-xs text-[#006B5B] font-medium mt-1 block">
                    Recovery efficiency
                  </span>
                </div>
              </div>

              {/* Defaulters Table */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900">
                  Overdue Invoices & Defaulters ({summaryData.defaulters.length})
                </h3>

                <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                  {summaryData.defaulters.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">Zero defaulters!</p>
                      <p className="text-xs text-gray-400 mt-1">
                        All dues for {selectedPeriod} have been paid or waived.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Payer Name</Th>
                          <Th>Contact</Th>
                          <Th>Fund</Th>
                          <Th className="text-right">Billed</Th>
                          <Th className="text-right">Collected</Th>
                          <Th className="text-right">Overdue Remaining</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {summaryData.defaulters.map((defaulter) => (
                          <Tr key={defaulter.dueId}>
                            <Td className="font-semibold text-gray-900">
                              {defaulter.payerName}
                            </Td>
                            <Td className="text-xs text-gray-500">
                              {defaulter.member?.user?.phone ||
                                defaulter.member?.user?.email ||
                                "—"}
                            </Td>
                            <Td className="text-xs text-gray-600">
                              {defaulter.fund.name}
                            </Td>
                            <Td className="text-right text-gray-700 font-medium">
                              {formatCurrency(defaulter.amount)}
                            </Td>
                            <Td className="text-right text-emerald-700 font-medium">
                              {formatCurrency(defaulter.paidAmount)}
                            </Td>
                            <Td className="text-right font-bold text-red-600">
                              {formatCurrency(defaulter.remainingAmount)}
                            </Td>
                            <Td>{getDueStatusBadge(defaulter.status)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreatePlanDialog
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        mosqueId={mosqueId}
      />

      <GenerateDuesDialog
        isOpen={isGenerateDuesOpen}
        onClose={() => setIsGenerateDuesOpen(false)}
        mosqueId={mosqueId}
      />

      <RecordDuePaymentDialog
        isOpen={Boolean(dueToPay)}
        onClose={() => setDueToPay(null)}
        mosqueId={mosqueId}
        due={dueToPay}
      />

      <WaiveDueDialog
        isOpen={Boolean(dueToWaive)}
        onClose={() => setDueToWaive(null)}
        mosqueId={mosqueId}
        due={dueToWaive}
      />
    </div>
  );
}
