"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useAuth } from "@/providers/auth-provider";
import { useMosque } from "@/providers/mosque-provider";
import { COLLECTION_OPERATOR_ROLES, FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import { CollectionSession, CollectionSessionsResponse } from "@/features/collections/types";
import { StartCollectionDialog } from "@/features/collections/start-collection-dialog";
import { VerifyCollectionDialog } from "@/features/collections/verify-collection-dialog";

export default function CollectionsPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { user } = useAuth();
  const { canAccess } = useMosque();

  // State
  const [isStartOpen, setIsStartOpen] = React.useState(false);
  const [sessionToVerify, setSessionToVerify] = React.useState<CollectionSession | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  const canStart = canAccess(COLLECTION_OPERATOR_ROLES);
  const canVerify = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Fetch collections
  const { data: collectionsData, isLoading } = useQuery<
    CollectionSessionsResponse | CollectionSession[]
  >({
    queryKey: ["collections", mosqueId, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.append("limit", "50");
      if (statusFilter) p.append("status", statusFilter);

      return apiClient.get<CollectionSessionsResponse | CollectionSession[]>(
        `/mosques/${mosqueId}/collections?${p.toString()}`
      );
    },
  });

  const collections: CollectionSession[] = React.useMemo(() => {
    if (!collectionsData) return [];
    if (Array.isArray(collectionsData)) return collectionsData;
    if (Array.isArray(collectionsData.data)) return collectionsData.data;
    if (Array.isArray((collectionsData as any).items)) return (collectionsData as any).items;
    return [];
  }, [collectionsData]);

  const filteredSessions = React.useMemo(() => {
    return collections.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.occasion.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)) ||
        (s.createdBy?.name && s.createdBy.name.toLowerCase().includes(q))
      );
    });
  }, [collections, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Cash Counting Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dual-control cash counts for Jummah, Eid, and donation box collections.
          </p>
        </div>

        {canStart && (
          <Button
            onClick={() => setIsStartOpen(true)}
            className="bg-[#006B5B] hover:bg-[#005246] text-white shadow-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Counting Session
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search occasion or counter..."
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
            <option value="OPEN">Open (Pending Verification)</option>
            <option value="VERIFIED">Verified & Posted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">
            Loading counting sessions...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Coins className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No counting sessions found</p>
            <p className="text-xs text-gray-400 mt-1">
              Start a counting session after prayer or donation box opening.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Occasion</Th>
                <Th className="text-right">Counted Amount</Th>
                <Th>Target Fund / Account</Th>
                <Th>Counted By</Th>
                <Th>Status</Th>
                <Th>Verified By</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSessions.map((session) => {
                const isOpen = session.status === "OPEN";
                const isSelfCounted = Boolean(
                  user?.id && session.createdBy?.id && user.id === session.createdBy.id
                );

                return (
                  <Tr key={session.id}>
                    <Td className="whitespace-nowrap font-medium text-gray-700">
                      {new Date(session.date).toLocaleDateString()}
                    </Td>
                    <Td>
                      <span className="font-semibold text-gray-900 block">
                        {session.occasion}
                      </span>
                      {session.notes && (
                        <span className="text-xs text-gray-500 line-clamp-1">
                          {session.notes}
                        </span>
                      )}
                    </Td>
                    <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                      {formatCurrency(session.totalAmount)}
                    </Td>
                    <Td className="text-xs text-gray-600">
                      <div>Fund: {session.fund?.name || "General Fund"}</div>
                      <div>Acct: {session.account?.name || "Main Cash Box"}</div>
                    </Td>
                    <Td className="text-xs text-gray-700">
                      <span className="font-medium">
                        {session.createdBy?.name || "Staff Officer"}
                      </span>
                      {isSelfCounted && (
                        <span className="block text-[10px] text-amber-700 font-bold bg-amber-100 px-1 py-0.2 rounded w-fit mt-0.5">
                          You
                        </span>
                      )}
                    </Td>
                    <Td>
                      {isOpen ? (
                        <Badge variant="warning">Open (Pending)</Badge>
                      ) : (
                        <Badge variant="success">Verified & Posted</Badge>
                      )}
                    </Td>
                    <Td className="text-xs text-gray-700">
                      {session.verifiedBy ? (
                        <div>
                          <span className="font-medium text-emerald-800">
                            {session.verifiedBy.name}
                          </span>
                          {session.donation?.receiptNumber && (
                            <span className="block text-[11px] text-gray-500 font-mono">
                              Rcpt: {session.donation.receiptNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Awaiting Verifier</span>
                      )}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      {isOpen && canVerify ? (
                        <Button
                          size="sm"
                          className="text-xs bg-[#006B5B] hover:bg-[#005246] text-white"
                          disabled={isSelfCounted}
                          title={
                            isSelfCounted
                              ? "Self-verification blocked by dual-control policy"
                              : "Verify count and post anonymous income"
                          }
                          onClick={() => setSessionToVerify(session)}
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1" />
                          Verify & Post
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

      {/* Start Session Dialog */}
      <StartCollectionDialog
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        mosqueId={mosqueId}
      />

      {/* Verify Dialog */}
      <VerifyCollectionDialog
        isOpen={Boolean(sessionToVerify)}
        onClose={() => setSessionToVerify(null)}
        mosqueId={mosqueId}
        session={sessionToVerify}
      />
    </div>
  );
}
