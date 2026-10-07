"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Landmark, Plus, Edit2, Scale, Archive, Loader2, AlertCircle } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { AccountItem } from "@/features/accounts/types";
import { AccountDialog } from "@/features/accounts/components/account-dialog";
import { ReconciliationDialog } from "@/features/accounts/components/reconciliation-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMosque } from "@/providers/mosque-provider";

export default function AccountsPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const queryClient = useQueryClient();
  const { canAccess } = useMosque();

  const [isAccountDialogOpen, setIsAccountDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<AccountItem | null>(null);

  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = React.useState(false);
  const [reconcilingAccount, setReconcilingAccount] = React.useState<AccountItem | null>(null);

  const { data: accounts, isLoading, isError, refetch } = useQuery<AccountItem[]>({
    queryKey: ["mosque", mosqueId, "accounts"],
    queryFn: () => apiClient.get<AccountItem[]>(`/mosques/${mosqueId}/accounts`),
    enabled: !!mosqueId,
  });

  const archiveMutation = useMutation({
    mutationFn: (accountId: string) =>
      apiClient.post(`/mosques/${mosqueId}/accounts/${accountId}/archive`),
    onSuccess: () => {
      toast.success("Account archived successfully");
      queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "accounts"] });
    },
    onError: (err: ApiError) => {
      toast.error("Failed to archive account", {
        description: err.message || "An account with a non-zero balance cannot be archived.",
      });
    },
  });

  const isFinOps = canAccess(["MOSQUE_ADMIN", "TREASURER"]);
  const isAdmin = canAccess(["MOSQUE_ADMIN"]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Accounts & Treasury
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage bank accounts, mobile wallets, cash in hand, and audit reconciliations.
          </p>
        </div>

        {isFinOps && (
          <Button
            size="sm"
            onClick={() => {
              setEditingAccount(null);
              setIsAccountDialogOpen(true);
            }}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Account
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden border-border bg-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading accounts...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Failed to load accounts</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : accounts && accounts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account / Ref Number</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
                {isFinOps && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-semibold text-foreground">
                    {acc.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground capitalize">
                      {acc.type.toLowerCase().replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {acc.accountNumber || "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatCurrency(acc.openingBalance)}
                  </TableCell>
                  <TableCell className="text-right font-bold font-heading text-foreground">
                    {formatCurrency(acc.currentBalance ?? acc.openingBalance)}
                  </TableCell>
                  {isFinOps && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setReconcilingAccount(acc);
                            setIsReconcileDialogOpen(true);
                          }}
                          className="gap-1 text-[11px]"
                          title="Audit Reconciliation"
                        >
                          <Scale className="w-3 h-3 text-primary" /> Reconcile
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setEditingAccount(acc);
                            setIsAccountDialogOpen(true);
                          }}
                          title="Edit Account"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              if (confirm(`Are you sure you want to archive "${acc.name}"?`)) {
                                archiveMutation.mutate(acc.id);
                              }
                            }}
                            disabled={archiveMutation.isPending}
                            title="Archive Account"
                          >
                            <Archive className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Landmark className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No physical accounts created yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Add your mosque&apos;s bank accounts or cash safe boxes to record donations and track balances.
            </p>
          </div>
        )}
      </Card>

      {/* Account Dialog */}
      <AccountDialog
        isOpen={isAccountDialogOpen}
        onClose={() => {
          setIsAccountDialogOpen(false);
          setEditingAccount(null);
        }}
        mosqueId={mosqueId}
        initialData={editingAccount}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "accounts"] });
        }}
      />

      {/* Reconciliation Dialog */}
      <ReconciliationDialog
        isOpen={isReconcileDialogOpen}
        onClose={() => {
          setIsReconcileDialogOpen(false);
          setReconcilingAccount(null);
        }}
        mosqueId={mosqueId}
        account={reconcilingAccount}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "accounts"] });
        }}
      />
    </div>
  );
}

