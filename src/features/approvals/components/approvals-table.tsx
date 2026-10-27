"use client";

import {
  Clock,
  CheckCircle2,
  Eye,
  XCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { UnifiedApprovalRow, DelayedCommitItem, ApprovalSortOption } from "../types";
import { UnifiedTransactionItem } from "@/features/transactions/types";
import { CollectionSession } from "@/features/collections/types";

interface ApprovalsTableProps {
  rows: UnifiedApprovalRow[];
  totalFilteredCount: number;
  isDataLoading: boolean;
  totalKpiCount: number;
  currentUserId?: string | null;
  // Sorting
  sortBy: ApprovalSortOption;
  onSortChange: (sort: ApprovalSortOption) => void;
  // Bulk approve
  eligibleDonationsCount: number;
  bulkDonationsTotal: bigint;
  onBulkApproveDonations: () => void;
  // Delayed commit state
  delayedCommits: Record<string, DelayedCommitItem>;
  onCancelDelayedCommit: (id: string) => void;
  // Row actions
  onViewDetails: (txId: string) => void;
  onRejectTransaction: (tx: UnifiedTransactionItem) => void;
  onApproveTransaction: (tx: UnifiedTransactionItem) => void;
  onVerifyCollection: (collection: CollectionSession) => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function ApprovalsTable({
  rows,
  totalFilteredCount,
  isDataLoading,
  totalKpiCount,
  currentUserId,
  delayedCommits,
  onCancelDelayedCommit,
  onViewDetails,
  onRejectTransaction,
  onApproveTransaction,
  onVerifyCollection,
}: ApprovalsTableProps) {

  return (
    <div className="bg-card rounded-[14px] border border-border  overflow-hidden">
      {/* Table Top Header Bar (Matching All Deals + Sort By in Reference) */}
    

      {/* Table Body */}
      {isDataLoading ? (
        <div className="py-20 text-center space-y-3">
          <Clock className="w-8 h-8 text-[#006B5B] animate-spin mx-auto opacity-70" />
          <p className="text-xs text-muted-foreground">Loading pending items...</p>
        </div>
      ) : totalFilteredCount === 0 ? (
        <div className="py-20 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
          <h3 className="text-base font-semibold text-foreground">
            {totalKpiCount === 0
              ? "All Clear! No Pending Approvals"
              : "No matching pending approvals"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {totalKpiCount === 0
              ? "All recordings and cash box counts have been reviewed and posted to the master ledger."
              : "Try adjusting your search criteria or filter settings to view other queue items."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <Tr className="border-b border-border/80 bg-muted/20">
                <Th className="text-xs font-semibold py-3.5">Item Name</Th>
                <Th className="text-xs font-semibold py-3.5">Fund & Account</Th>
                <Th className="text-xs font-semibold py-3.5">Amount</Th>
                <Th className="text-xs font-semibold py-3.5">Stage / Type</Th>
                <Th className="text-xs font-semibold py-3.5">Owner</Th>
                <Th className="text-xs font-semibold py-3.5">Date</Th>
                <Th className="text-xs font-semibold py-3.5 text-right">Status & Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => {
                const isDelayed = Boolean(delayedCommits[row.id]);
                const delayItem = delayedCommits[row.id];
                const isSelfCreated = Boolean(
                  currentUserId && row.createdById && currentUserId === row.createdById
                );

                return (
                  <Tr
                    key={row.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      isDelayed ? "bg-amber-500/5 font-medium" : ""
                    }`}
                  >
                    {/* 1. Item Name / Description (Deal Name) */}
                    <Td className="py-4">
                      <div className="font-semibold text-xs text-foreground truncate max-w-xs">
                        {row.title}
                      </div>
                      {row.subtitle && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                          {row.subtitle}
                        </div>
                      )}
                    </Td>

                    {/* 2. Fund & Account (Company) */}
                    <Td className="py-4">
                      <div className="text-xs font-medium text-foreground truncate max-w-[150px]">
                        {row.fundName}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                        {row.accountName}
                      </div>
                    </Td>

                    {/* 3. Value / Amount (Value) */}
                    <Td className="py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-bold ${
                          row.transactionType === "DONATION"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : row.transactionType === "EXPENSE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {formatCurrency(row.amount)}
                      </span>
                    </Td>

                    {/* 4. Stage / Type (Stage with Colored Dot matching Reference) */}
                    <Td className="py-4 whitespace-nowrap">
                      {row.transactionType === "DONATION" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          Donation
                        </span>
                      ) : row.transactionType === "EXPENSE" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                          Expense
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          Box Count
                        </span>
                      )}
                    </Td>

                    {/* 5. Owner / Recorded By (Matching Reference Owner with Avatar) */}
                    <Td className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                          {row.createdByName.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate max-w-[120px]">
                          <span className="text-xs font-medium text-foreground block">
                            {row.createdByName}
                          </span>
                          {isSelfCreated && (
                            <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                              Self-Recorded
                            </span>
                          )}
                        </div>
                      </div>
                    </Td>

                    {/* 6. Date (Expected Close) */}
                    <Td className="py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Td>

                    {/* 7. Status & Actions (Status Column) */}
                    <Td className="py-4 text-right whitespace-nowrap">
                      {isDelayed ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                            <Clock className="w-3 h-3 animate-spin" />
                            Commit in {delayItem.secondsRemaining}s
                          </span>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => onCancelDelayedCommit(row.id)}
                            className="text-xs h-7 px-2 border-amber-600 text-amber-700 dark:text-amber-300 font-semibold"
                          >
                            Undo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Status Badge in Soft Pill */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mr-1">
                            Pending
                          </span>

                          {/* View Details */}
                          {row.rawTransaction && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onViewDetails(row.id)}
                              title="View Details"
                              className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Reject Button (Transactions only) */}
                          {row.rawTransaction && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onRejectTransaction(row.rawTransaction!)}
                              title="Reject Transaction"
                              className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Approve / Verify Button */}
                          {row.sourceType === "COLLECTION" ? (
                            <Button
                              size="xs"
                              disabled={isSelfCreated}
                              onClick={() => onVerifyCollection(row.rawCollection!)}
                              title={
                                isSelfCreated
                                  ? "Self-verification blocked by dual control"
                                  : "Verify & Post Collection"
                              }
                              className="h-7 px-2.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-2xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Verify
                            </Button>
                          ) : (
                            <Button
                              size="xs"
                              disabled={isSelfCreated}
                              onClick={() => onApproveTransaction(row.rawTransaction!)}
                              title={
                                isSelfCreated
                                  ? "Self-approval blocked by policy"
                                  : "Approve (5s undo grace period)"
                              }
                              className="h-7 px-2.5 text-xs bg-[#006B5B] hover:bg-[#005246] text-white font-medium rounded-lg shadow-2xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

