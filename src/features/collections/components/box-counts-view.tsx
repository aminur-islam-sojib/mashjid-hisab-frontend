"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  Plus,
  Search,
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
import { CollectionSession, CollectionSessionsResponse } from "../types";
import { StartCollectionDialog } from "../start-collection-dialog";
import { VerifyCollectionDialog } from "../verify-collection-dialog";

export function BoxCountsView({ mosqueId }: { mosqueId: string }) {
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
    enabled: Boolean(mosqueId),
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
      {/* Sub-header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Box Count (Jummah, Eid...)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Two-person verified cash counts for Friday Jummah and donation box openings.
          </p>
        </div>

        {canStart && (
          <Button
            size="sm"
            onClick={() => setIsStartOpen(true)}
            className="font-semibold gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Count Box
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search occasion or counter..."
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
            <option value="OPEN">Open (Waiting for approval)</option>
            <option value="VERIFIED">Verified & Posted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading box counts...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Coins className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
            <p className="font-semibold text-sm text-foreground">No box counts found</p>
            <p className="text-xs text-muted-foreground">
              Start a count after prayer or when opening a donation box.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Occasion</Th>
                <Th className="text-right">Counted Amount</Th>
                <Th>Cash & Bank / Fund</Th>
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
                    <Td className="whitespace-nowrap font-medium text-xs text-foreground">
                      {new Date(session.date).toLocaleDateString()}
                    </Td>
                    <Td>
                      <span className="font-semibold text-xs text-foreground block">
                        {session.occasion}
                      </span>
                      {session.notes && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {session.notes}
                        </span>
                      )}
                    </Td>
                    <Td className="text-right font-bold text-xs text-primary whitespace-nowrap">
                      {formatCurrency(session.totalAmount)}
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      <div>Fund: {session.fund?.name || "General Fund"}</div>
                      <div>Account: {session.account?.name || "Main Cash Box"}</div>
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {session.createdBy?.name || "Staff"}
                      </span>
                      {isSelfCounted && (
                        <span className="block text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/40 px-1 py-0.5 rounded w-fit mt-0.5">
                          You
                        </span>
                      )}
                    </Td>
                    <Td>
                      {isOpen ? (
                        <Badge variant="gold" className="text-[10px]">Waiting for approval</Badge>
                      ) : (
                        <Badge variant="teal" className="text-[10px]">Verified & Posted</Badge>
                      )}
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      {session.verifiedBy ? (
                        <div>
                          <span className="font-medium text-foreground">
                            {session.verifiedBy.name}
                          </span>
                          {session.donation?.receiptNumber && (
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              Receipt: {session.donation.receiptNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Waiting for approval</span>
                      )}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      {isOpen && canVerify ? (
                        <Button
                          size="xs"
                          disabled={isSelfCounted}
                          title={
                            isSelfCounted
                              ? "Self-verification blocked by dual-control policy"
                              : "Verify count and post to ledger"
                          }
                          onClick={() => setSessionToVerify(session)}
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1" />
                          Verify & Post
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

