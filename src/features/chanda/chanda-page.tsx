"use client";

import * as React from "react";
import {
  CalendarHeart,
  Plus,
  Sparkles,
  Receipt,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMosque } from "@/providers/mosque-provider";
import { ADMIN_ONLY_ROLES, FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import { ChandaPlan, DueRecord } from "./types";
import { useDues } from "./hooks/use-dues";
import { useChandaPlans } from "./hooks/use-chanda-plans";
import { useDuesSummary } from "./hooks/use-dues-summary";
import { usePlanMutations } from "./hooks/use-plan-mutations";
import { DuesToolbar } from "./components/dues-toolbar";
import { DuesTable } from "./components/dues-table";
import { PlansTable } from "./components/plans-table";
import { AnalyticsView } from "./components/analytics-view";
import { CreatePlanDialog } from "./create-plan-dialog";
import { GenerateDuesDialog } from "./generate-dues-dialog";
import { RecordDuePaymentDialog } from "./record-due-payment-dialog";
import { WaiveDueDialog } from "./waive-due-dialog";

interface ChandaPageProps {
  mosqueId: string;
}

export function ChandaPage({ mosqueId }: ChandaPageProps) {
  const { canAccess } = useMosque();

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

  const isAdmin = canAccess(ADMIN_ONLY_ROLES);
  const canManagePlans = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Queries
  const { data: duesData, isLoading: isDuesLoading } = useDues(
    mosqueId,
    selectedPeriod,
    statusFilter,
    activeTab === "dues"
  );

  const { data: plansData, isLoading: isPlansLoading } = useChandaPlans(
    mosqueId,
    activeTab === "plans"
  );

  const { data: summaryData, isLoading: isSummaryLoading } = useDuesSummary(
    mosqueId,
    selectedPeriod,
    activeTab === "analytics"
  );

  // Mutations
  const { pausePlanMutation, resumePlanMutation, endPlanMutation } =
    usePlanMutations(mosqueId);

  const isMutationPending =
    pausePlanMutation.isPending ||
    resumePlanMutation.isPending ||
    endPlanMutation.isPending;

  const duesList: DueRecord[] = React.useMemo(() => {
    if (!duesData) return [];
    if (Array.isArray(duesData)) return duesData;
    if (Array.isArray((duesData as any).data)) return (duesData as any).data;
    if (Array.isArray((duesData as any).items)) return (duesData as any).items;
    if (Array.isArray((duesData as any).dues)) return (duesData as any).dues;
    return [];
  }, [duesData]);

  const plansList: ChandaPlan[] = React.useMemo(() => {
    if (!plansData) return [];
    if (Array.isArray(plansData)) return plansData;
    if (Array.isArray((plansData as any).data)) return (plansData as any).data;
    if (Array.isArray((plansData as any).items)) return (plansData as any).items;
    if (Array.isArray((plansData as any).plans)) return (plansData as any).plans;
    return [];
  }, [plansData]);

  // Filtered Dues
  const filteredDues = React.useMemo(() => {
    return duesList.filter((d: DueRecord) => {
      const payerName = d.member?.user?.name || d.family?.name || "";
      return payerName.toLowerCase().includes(search.toLowerCase());
    });
  }, [duesList, search]);

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
          <DuesToolbar
            search={search}
            onSearchChange={setSearch}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <DuesTable
            dues={filteredDues}
            isLoading={isDuesLoading}
            selectedPeriod={selectedPeriod}
            isAdmin={isAdmin}
            onPay={setDueToPay}
            onWaive={setDueToWaive}
          />
        </div>
      )}

      {/* Tab 2: Recurring Plans */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <PlansTable
            plans={plansList}
            isLoading={isPlansLoading}
            canManagePlans={canManagePlans}
            onPause={(id) => pausePlanMutation.mutate(id)}
            onResume={(id) => resumePlanMutation.mutate(id)}
            onEnd={(id) => endPlanMutation.mutate(id)}
            isActionPending={isMutationPending}
          />
        </div>
      )}

      {/* Tab 3: Collection Analytics */}
      {activeTab === "analytics" && (
        <AnalyticsView
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          summaryData={summaryData}
          isLoading={isSummaryLoading}
        />
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
