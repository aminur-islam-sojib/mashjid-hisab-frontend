"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HeartHandshake,
  Plus,
  Search,
  Ban,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import { PledgeRecord, PledgeStatus } from "../types";
import { RecordPledgeDialog } from "../record-pledge-dialog";
import { CancelPledgeDialog } from "../cancel-pledge-dialog";

export function PledgesView({ mosqueId }: { mosqueId: string }) {
  const { canAccess } = useMosque();

  // State
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [isRecordOpen, setIsRecordOpen] = React.useState(false);
  const [pledgeToCancel, setPledgeToCancel] = React.useState<PledgeRecord | null>(null);

  const canRecord = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Fetch pledges
  const { data: pledgesData, isLoading } = useQuery<{
    data?: PledgeRecord[];
    items?: PledgeRecord[];
  } | PledgeRecord[]>({
    queryKey: ["pledges", mosqueId, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.append("limit", "100");
      if (statusFilter) p.append("status", statusFilter);

      return apiClient.get(
        `/mosques/${mosqueId}/pledges?${p.toString()}`
      );
    },
    enabled: Boolean(mosqueId),
  });

  const pledges: PledgeRecord[] = React.useMemo(() => {
    if (!pledgesData) return [];
    if (Array.isArray(pledgesData)) return pledgesData;
    if (Array.isArray(pledgesData.data)) return pledgesData.data;
    if (Array.isArray((pledgesData as any).items)) return (pledgesData as any).items;
    return [];
  }, [pledgesData]);

  const filteredPledges = React.useMemo(() => {
    return pledges.filter((p) => {
      const q = search.toLowerCase();
      const donor =
        p.member?.user?.name ||
        p.donorName ||
        p.donorPhone ||
        "";
      return donor.toLowerCase().includes(q) || (p.notes && p.notes.toLowerCase().includes(q));
    });
  }, [pledges, search]);

  // Aggregate Metrics
  const metrics = React.useMemo(() => {
    if (!pledges) return { totalPledged: 0n, totalPaid: 0n, totalOutstanding: 0n, fulfilled: 0 };
    let totalPledged = 0n;
    let totalPaid = 0n;
    let fulfilled = 0;

    for (const p of pledges) {
      if (p.status !== "CANCELLED") {
        totalPledged += BigInt(p.amount || "0");
        totalPaid += BigInt(p.paidAmount || "0");
      }
      if (p.status === "FULFILLED") fulfilled++;
    }

    const totalOutstanding = totalPledged > totalPaid ? totalPledged - totalPaid : 0n;
    return { totalPledged, totalPaid, totalOutstanding, fulfilled };
  }, [pledges]);

  const getStatusBadge = (status: PledgeStatus) => {
    switch (status) {
      case "FULFILLED":
        return <Badge variant="success" className="text-[10px]">Fulfilled</Badge>;
      case "PARTIAL":
        return <Badge variant="warning" className="text-[10px]">Partial</Badge>;
      case "OPEN":
        return <Badge variant="info" className="text-[10px]">Open</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" className="text-[10px]">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Donor Pledges
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track promised donations, installment commitments, and fulfillment progress.
          </p>
        </div>

        {canRecord && (
          <Button
            size="sm"
            onClick={() => setIsRecordOpen(true)}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" />
            Record Pledge
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border shadow-xs">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Total Pledged
          </span>
          <div className="text-xl font-bold text-foreground mt-1 font-heading">
            {formatCurrency(metrics.totalPledged.toString())}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Active commitments</span>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border shadow-xs">
          <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
            Collected To Date
          </span>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 font-heading">
            {formatCurrency(metrics.totalPaid.toString())}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            {metrics.fulfilled} pledges fulfilled
          </span>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border shadow-xs">
          <span className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
            Outstanding Balance
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-300 mt-1 font-heading">
            {formatCurrency(metrics.totalOutstanding.toString())}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block">
            Awaiting payments
          </span>
        </div>

        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-xs">
          <span className="text-xs font-semibold uppercase text-primary tracking-wider">
            Fulfillment Rate
          </span>
          <div className="text-2xl font-black text-primary mt-1 font-heading">
            {metrics.totalPledged > 0n
              ? Math.round(Number((metrics.totalPaid * 100n) / metrics.totalPledged))
              : 0}
            %
          </div>
          <span className="text-[11px] text-primary font-medium mt-1 block">
            Collection progress
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pledger name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open (No Payments)</option>
            <option value="PARTIAL">Partial</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading pledges...
          </div>
        ) : filteredPledges.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <HeartHandshake className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
            <p className="font-semibold text-sm text-foreground">No pledges found</p>
            <p className="text-xs text-muted-foreground">
              Click &quot;Record Pledge&quot; above to record a new donation promise.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Due Date</Th>
                <Th>Pledger / Donor</Th>
                <Th>Target (Fund / Campaign)</Th>
                <Th className="text-right">Pledged</Th>
                <Th className="text-right">Paid</Th>
                <Th className="text-right">Remaining</Th>
                <Th>Installments</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPledges.map((pledge) => {
                const total = BigInt(pledge.amount || "0");
                const paid = BigInt(pledge.paidAmount || "0");
                const diff = total - paid;
                const remaining = diff > 0n ? diff : 0n;

                const isCancellable =
                  pledge.status === "OPEN" || pledge.status === "PARTIAL";

                return (
                  <Tr key={pledge.id}>
                    <Td className="whitespace-nowrap font-medium text-xs text-muted-foreground">
                      {new Date(pledge.dueDate).toLocaleDateString()}
                    </Td>
                    <Td>
                      <span className="font-semibold text-xs text-foreground block">
                        {pledge.member?.user?.name || pledge.donorName || "Donor"}
                      </span>
                      {(pledge.member?.user?.phone || pledge.donorPhone) && (
                        <span className="text-xs text-muted-foreground/80 font-normal">
                          {pledge.member?.user?.phone || pledge.donorPhone}
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      {pledge.campaign ? (
                        <span className="text-primary font-medium block">
                          Campaign: {pledge.campaign.title}
                        </span>
                      ) : pledge.fund ? (
                        <span>Fund: {pledge.fund.name}</span>
                      ) : (
                        "General Fund"
                      )}
                    </Td>
                    <Td className="text-right font-bold text-xs text-foreground whitespace-nowrap">
                      {formatCurrency(pledge.amount)}
                    </Td>
                    <Td className="text-right font-semibold text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(pledge.paidAmount)}
                    </Td>
                    <Td className="text-right font-bold text-xs text-primary whitespace-nowrap">
                      {formatCurrency(remaining.toString())}
                    </Td>
                    <Td className="text-xs text-muted-foreground text-center">
                      {pledge.installments || 1}
                    </Td>
                    <Td>{getStatusBadge(pledge.status)}</Td>
                    <Td className="text-right whitespace-nowrap">
                      {isCancellable ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setPledgeToCancel(pledge)}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Record Dialog */}
      <RecordPledgeDialog
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Cancel Dialog */}
      <CancelPledgeDialog
        isOpen={Boolean(pledgeToCancel)}
        onClose={() => setPledgeToCancel(null)}
        mosqueId={mosqueId}
        pledge={pledgeToCancel}
      />
    </div>
  );
}

