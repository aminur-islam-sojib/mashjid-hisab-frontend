"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PiggyBank, Plus, Edit2, Archive, Loader2, AlertCircle } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { FundItem } from "@/features/funds/types";
import { FundDialog } from "@/features/funds/components/fund-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMosque } from "@/providers/mosque-provider";

export default function FundsPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const queryClient = useQueryClient();
  const { canAccess } = useMosque();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFund, setEditingFund] = React.useState<FundItem | null>(null);

  const { data: funds, isLoading, isError, refetch } = useQuery<FundItem[]>({
    queryKey: ["mosque", mosqueId, "funds"],
    queryFn: () => apiClient.get<FundItem[]>(`/mosques/${mosqueId}/funds`),
    enabled: !!mosqueId,
  });

  const archiveMutation = useMutation({
    mutationFn: (fundId: string) =>
      apiClient.post(`/mosques/${mosqueId}/funds/${fundId}/archive`),
    onSuccess: () => {
      toast.success("Fund archived successfully");
      queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "funds"] });
    },
    onError: (err: ApiError) => {
      toast.error("Failed to archive fund", {
        description: err.message || "A fund with non-zero balance cannot be archived.",
      });
    },
  });

  const isAdmin = canAccess(["MOSQUE_ADMIN"]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Accounting Funds
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize general, Zakat, Sadaqah, and restricted community funds.
          </p>
        </div>

        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setEditingFund(null);
              setIsDialogOpen(true);
            }}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Fund
          </Button>
        )}
      </div>

      {/* Funds Table Card */}
      <Card className="overflow-hidden border-border bg-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading funds...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Failed to load funds</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : funds && funds.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell className="font-semibold text-foreground">
                    {fund.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-medium capitalize">
                      {fund.type.toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {fund.isRestricted ? (
                      <Badge variant="gold" className="text-[10px]">
                        Restricted
                      </Badge>
                    ) : (
                      <Badge variant="teal" className="text-[10px]">
                        General
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {fund.description || "—"}
                  </TableCell>
                  <TableCell className="text-right font-bold font-heading text-foreground">
                    {fund.currentBalance !== undefined
                      ? formatCurrency(fund.currentBalance)
                      : "—"}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setEditingFund(fund);
                            setIsDialogOpen(true);
                          }}
                          title="Edit Fund"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            if (confirm(`Are you sure you want to archive "${fund.name}"?`)) {
                              archiveMutation.mutate(fund.id);
                            }
                          }}
                          disabled={archiveMutation.isPending}
                          title="Archive Fund"
                        >
                          <Archive className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center space-y-3">
            <PiggyBank className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No funds created yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Create your first fund such as General Mosque Fund or Zakat Fund to start recording income.
            </p>
          </div>
        )}
      </Card>

      {/* Fund Create/Edit Dialog */}
      <FundDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingFund(null);
        }}
        mosqueId={mosqueId}
        initialData={editingFund}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "funds"] });
        }}
      />
    </div>
  );
}

