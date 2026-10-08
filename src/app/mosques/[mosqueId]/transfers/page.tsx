"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeftRight, Plus, Ban, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { TransferItem } from "@/features/transfers/types";
import { TransferDialog } from "@/features/transfers/components/transfer-dialog";
import { FundItem } from "@/features/funds/types";
import { AccountItem } from "@/features/accounts/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES, ADMIN_ONLY_ROLES } from "@/lib/roles";
import { PaginatedResult } from "@/types/api";

export default function TransfersPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const queryClient = useQueryClient();
  const { canAccess } = useMosque();

  const [page, setPage] = React.useState(1);
  const [isTransferOpen, setIsTransferOpen] = React.useState(false);

  const { data: transfersData, isLoading, isError, refetch } = useQuery<PaginatedResult<TransferItem>>({
    queryKey: ["mosque", mosqueId, "transfers", { page }],
    queryFn: () => apiClient.get<PaginatedResult<TransferItem>>(`/mosques/${mosqueId}/transfers?page=${page}&limit=15`),
    enabled: !!mosqueId,
  });

  const { data: funds } = useQuery<FundItem[]>({
    queryKey: ["mosque", mosqueId, "funds"],
    queryFn: () => apiClient.get<FundItem[]>(`/mosques/${mosqueId}/funds`),
    enabled: !!mosqueId,
  });

  const { data: accounts } = useQuery<AccountItem[]>({
    queryKey: ["mosque", mosqueId, "accounts"],
    queryFn: () => apiClient.get<AccountItem[]>(`/mosques/${mosqueId}/accounts`),
    enabled: !!mosqueId,
  });

  const voidMutation = useMutation({
    mutationFn: (transferId: string) => {
      const reason = prompt("Enter audit reason for voiding this transfer:");
      if (!reason || reason.trim().length < 3) {
        throw new Error("A void reason with at least 3 characters is required.");
      }
      return apiClient.post(`/mosques/${mosqueId}/transfers/${transferId}/void`, { reason });
    },
    onSuccess: () => {
      toast.success("Transfer voided successfully");
      queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "transfers"] });
      queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "dashboard-report"] });
    },
    onError: (err: ApiError | Error) => {
      toast.error("Failed to void transfer", { description: err.message });
    },
  });

  const isFinOps = canAccess(FINANCIAL_OPERATOR_ROLES);
  const isAdmin = canAccess(ADMIN_ONLY_ROLES);

  const items = transfersData?.items || [];
  const pagination = transfersData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Treasury Transfers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Move balances between bank & cash accounts or reallocate between funds.
          </p>
        </div>

        {isFinOps && (
          <Button
            size="sm"
            onClick={() => setIsTransferOpen(true)}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" /> Transfer Funds
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden border-border bg-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading transfers...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Failed to load transfers</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From Account</TableHead>
                  <TableHead>To Account</TableHead>
                  <TableHead>Fund Allocation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((transfer) => {
                  const isVoided = transfer.status === "VOIDED";

                  return (
                    <TableRow key={transfer.id} className={isVoided ? "opacity-60 bg-muted/20" : ""}>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(transfer.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {transfer.fromAccount?.name || "Source Account"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {transfer.toAccount?.name || "Destination Account"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {transfer.isFundTransfer ? (
                          <span>
                            {transfer.fromFund?.name} → <strong className="text-foreground">{transfer.toFund?.name}</strong>
                          </span>
                        ) : (
                          transfer.fromFund?.name || "General"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transfer.isFundTransfer ? "gold" : "secondary"} className="text-[10px]">
                          {transfer.isFundTransfer ? "Fund-to-Fund" : "Account Transfer"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transfer.status === "POSTED" ? "teal" : "destructive"} className="text-[10px]">
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold font-heading text-foreground">
                        <span className={isVoided ? "line-through text-muted-foreground" : "text-primary"}>
                          {formatCurrency(transfer.amount)}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {transfer.status === "POSTED" && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => voidMutation.mutate(transfer.id)}
                              disabled={voidMutation.isPending}
                              title="Void Transfer"
                            >
                              <Ban className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} entries)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center space-y-3">
            <ArrowLeftRight className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No treasury transfers recorded</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Execute transfers when depositing cash safe box funds into the bank or reallocating fund reserves.
            </p>
          </div>
        )}
      </Card>

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        mosqueId={mosqueId}
        funds={funds}
        accounts={accounts}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "transfers"] });
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "accounts"] });
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "dashboard-report"] });
        }}
      />
    </div>
  );
}

