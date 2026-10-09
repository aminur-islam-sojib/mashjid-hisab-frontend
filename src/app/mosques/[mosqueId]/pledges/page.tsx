"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  HeartHandshake,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Calendar,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import { PledgeRecord, PledgeStatus } from "@/features/pledges/types";
import { RecordPledgeDialog } from "@/features/pledges/record-pledge-dialog";
import { CancelPledgeDialog } from "@/features/pledges/cancel-pledge-dialog";

export default function PledgesPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
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
        return <Badge variant="success">Fulfilled</Badge>;
      case "PARTIAL":
        return <Badge variant="warning">Partial</Badge>;
      case "OPEN":
        return <Badge variant="info">Open</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Donor Pledges
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track promised donations, installment commitments, and fulfillment progress.
          </p>
        </div>

        {canRecord && (
          <Button
            onClick={() => setIsRecordOpen(true)}
            className="bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Pledge
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
            Total Pledged
          </span>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(metrics.totalPledged.toString())}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Active commitments</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
            Collected To Date
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {formatCurrency(metrics.totalPaid.toString())}
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            {metrics.fulfilled} pledges fulfilled
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase text-amber-600 tracking-wider">
            Outstanding Balance
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {formatCurrency(metrics.totalOutstanding.toString())}
          </div>
          <span className="text-xs text-amber-600 font-medium mt-1 block">
            Awaiting payments
          </span>
        </div>

        <div className="p-5 bg-[#E6F4F0] rounded-xl border border-[#006B5B]/20 shadow-xs">
          <span className="text-xs font-semibold uppercase text-[#006B5B] tracking-wider">
            Fulfillment Rate
          </span>
          <div className="text-3xl font-black text-[#006B5B] mt-1">
            {metrics.totalPledged > 0n
              ? Math.round(Number((metrics.totalPaid * 100n) / metrics.totalPledged))
              : 0}
            %
          </div>
          <span className="text-xs text-[#006B5B] font-medium mt-1 block">
            Collection progress
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pledger name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
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
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            Loading pledges...
          </div>
        ) : filteredPledges.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <HeartHandshake className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No pledges found</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Record Pledge" above to record a new donation promise.
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
                    <Td className="whitespace-nowrap font-medium text-gray-700">
                      {new Date(pledge.dueDate).toLocaleDateString()}
                    </Td>
                    <Td>
                      <span className="font-semibold text-gray-900 block">
                        {pledge.member?.user?.name || pledge.donorName || "Donor"}
                      </span>
                      {(pledge.member?.user?.phone || pledge.donorPhone) && (
                        <span className="text-xs text-gray-400 font-normal">
                          {pledge.member?.user?.phone || pledge.donorPhone}
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-gray-600">
                      {pledge.campaign ? (
                        <span className="text-[#006B5B] font-medium block">
                          Campaign: {pledge.campaign.title}
                        </span>
                      ) : pledge.fund ? (
                        <span>Fund: {pledge.fund.name}</span>
                      ) : (
                        "General Fund"
                      )}
                    </Td>
                    <Td className="text-right font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(pledge.amount)}
                    </Td>
                    <Td className="text-right font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(pledge.paidAmount)}
                    </Td>
                    <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                      {formatCurrency(remaining.toString())}
                    </Td>
                    <Td className="text-xs text-gray-600 text-center">
                      {pledge.installments || 1}
                    </Td>
                    <Td>{getStatusBadge(pledge.status)}</Td>
                    <Td className="text-right whitespace-nowrap">
                      {isCancellable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                          onClick={() => setPledgeToCancel(pledge)}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
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
