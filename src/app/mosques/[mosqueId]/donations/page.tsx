"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Plus, FileText, Ban, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { DonationItem } from "@/features/donations/types";
import { RecordDonationDialog } from "@/features/donations/components/record-donation-dialog";
import { DonationReceiptDialog } from "@/features/donations/components/donation-receipt-dialog";
import { VoidDonationDialog } from "@/features/donations/components/void-donation-dialog";
import { FundItem } from "@/features/funds/types";
import { AccountItem } from "@/features/accounts/types";
import { CategoryItem } from "@/features/categories/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMosque } from "@/providers/mosque-provider";
import { COLLECTION_OPERATOR_ROLES, FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import { PaginatedResult } from "@/types/api";

export default function DonationsPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const queryClient = useQueryClient();
  const { canAccess } = useMosque();

  const [page, setPage] = React.useState(1);
  const [isRecordOpen, setIsRecordOpen] = React.useState(false);

  const [selectedReceiptId, setSelectedReceiptId] = React.useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);

  const [selectedVoidDonation, setSelectedVoidDonation] = React.useState<DonationItem | null>(null);
  const [isVoidOpen, setIsVoidOpen] = React.useState(false);

  const { data: donationsData, isLoading, isError, refetch } = useQuery<PaginatedResult<DonationItem>>({
    queryKey: ["mosque", mosqueId, "donations", { page }],
    queryFn: () => apiClient.get<PaginatedResult<DonationItem>>(`/mosques/${mosqueId}/donations?page=${page}&limit=15`),
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

  const { data: categories } = useQuery<CategoryItem[]>({
    queryKey: ["mosque", mosqueId, "categories"],
    queryFn: () => apiClient.get<CategoryItem[]>(`/mosques/${mosqueId}/categories`),
    enabled: !!mosqueId,
  });

  const isCollectOps = canAccess(COLLECTION_OPERATOR_ROLES);
  const isFinOps = canAccess(FINANCIAL_OPERATOR_ROLES);

  const items = donationsData?.items || [];
  const pagination = donationsData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Donations & Income Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track community contributions, box collections, online giving, and official receipts.
          </p>
        </div>

        {isCollectOps && (
          <Button
            size="sm"
            onClick={() => setIsRecordOpen(true)}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" /> Record Donation
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden border-border bg-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading donations...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Failed to load donations</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Target Fund</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((donation) => {
                  const isVoided = donation.status === "VOIDED";
                  const isPending = donation.status === "PENDING";

                  return (
                    <TableRow key={donation.id} className={isVoided ? "opacity-60 bg-muted/20" : ""}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {donation.receiptNumber || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(donation.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-foreground">
                        {donation.isAnonymousPublic ? (
                          <span className="text-muted-foreground italic">Anonymous (Masked)</span>
                        ) : (
                          donation.donorName || "General / Box"
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {donation.fund?.name || "General"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {donation.category?.name || "Donation"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            donation.status === "POSTED"
                              ? "teal"
                              : donation.status === "PENDING"
                              ? "gold"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {donation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold font-heading text-foreground">
                        <span className={isVoided ? "line-through text-muted-foreground" : "text-primary"}>
                          {formatCurrency(donation.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {donation.status === "POSTED" && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedReceiptId(donation.id);
                                setIsReceiptOpen(true);
                              }}
                              title="View Official Receipt"
                            >
                              <FileText className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                          )}
                          {isFinOps && donation.status === "POSTED" && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedVoidDonation(donation);
                                setIsVoidOpen(true);
                              }}
                              title="Void Donation"
                            >
                              <Ban className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination controls */}
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
            <Coins className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No donations recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Record your first donation or Friday Jummah box collection to start building the ledger.
            </p>
          </div>
        )}
      </Card>

      {/* Record Donation Dialog */}
      <RecordDonationDialog
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        mosqueId={mosqueId}
        funds={funds}
        accounts={accounts}
        categories={categories}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "donations"] });
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "dashboard-report"] });
        }}
      />

      {/* Receipt Modal */}
      <DonationReceiptDialog
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedReceiptId(null);
        }}
        mosqueId={mosqueId}
        donationId={selectedReceiptId}
      />

      {/* Void Modal */}
      <VoidDonationDialog
        isOpen={isVoidOpen}
        onClose={() => {
          setIsVoidOpen(false);
          setSelectedVoidDonation(null);
        }}
        mosqueId={mosqueId}
        donation={selectedVoidDonation}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "donations"] });
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "dashboard-report"] });
        }}
      />
    </div>
  );
}

