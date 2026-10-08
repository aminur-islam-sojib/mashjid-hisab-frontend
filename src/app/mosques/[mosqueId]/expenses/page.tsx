"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingDown, Plus, Ban, Loader2, AlertCircle, ChevronLeft, ChevronRight, Paperclip } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { ExpenseItem } from "@/features/expenses/types";
import { RecordExpenseDialog } from "@/features/expenses/components/record-expense-dialog";
import { VoidExpenseDialog } from "@/features/expenses/components/void-expense-dialog";
import { FundItem } from "@/features/funds/types";
import { AccountItem } from "@/features/accounts/types";
import { CategoryItem } from "@/features/categories/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMosque } from "@/providers/mosque-provider";
import { EXPENSE_OPERATOR_ROLES, ADMIN_ONLY_ROLES } from "@/lib/roles";
import { PaginatedResult } from "@/types/api";

export default function ExpensesPage() {
  const params = useParams();
  const mosqueId = String(params?.["mosqueId"] || "");
  const queryClient = useQueryClient();
  const { canAccess } = useMosque();

  const [page, setPage] = React.useState(1);
  const [isRecordOpen, setIsRecordOpen] = React.useState(false);

  const [selectedVoidExpense, setSelectedVoidExpense] = React.useState<ExpenseItem | null>(null);
  const [isVoidOpen, setIsVoidOpen] = React.useState(false);

  const { data: expensesData, isLoading, isError, refetch } = useQuery<PaginatedResult<ExpenseItem>>({
    queryKey: ["mosque", mosqueId, "expenses", { page }],
    queryFn: () => apiClient.get<PaginatedResult<ExpenseItem>>(`/mosques/${mosqueId}/expenses?page=${page}&limit=15`),
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

  const isExpenseOps = canAccess(EXPENSE_OPERATOR_ROLES);
  const isAdmin = canAccess(ADMIN_ONLY_ROLES);

  const items = expensesData?.items || [];
  const pagination = expensesData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Expenses & Disbursements
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track operational expenses, utility bills, maintenance, and vendor disbursements.
          </p>
        </div>

        {isExpenseOps && (
          <Button
            size="sm"
            onClick={() => setIsRecordOpen(true)}
            className="gap-1.5 self-start sm:self-auto font-semibold"
          >
            <Plus className="w-4 h-4" /> Record Expense
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden border-border bg-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading expenses...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm font-semibold text-destructive">Failed to load expenses</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payee / Vendor</TableHead>
                  <TableHead>Charged Fund</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((expense) => {
                  const isVoided = expense.status === "VOIDED";

                  return (
                    <TableRow key={expense.id} className={isVoided ? "opacity-60 bg-muted/20" : ""}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {expense.voucherNo || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-foreground">
                        {expense.payee}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {expense.fund?.name || "General"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {expense.category?.name || "Expense"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {expense.account?.name || "Cash"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            expense.status === "POSTED"
                              ? "teal"
                              : expense.status === "PENDING" || expense.status === "PENDING_APPROVAL"
                              ? "gold"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {expense.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold font-heading text-foreground">
                        <span className={isVoided ? "line-through text-muted-foreground" : "text-rose-600 dark:text-rose-400"}>
                          {formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {expense.status === "POSTED" && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                  setSelectedVoidExpense(expense);
                                  setIsVoidOpen(true);
                                }}
                                title="Void Expense"
                              >
                                <Ban className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
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
            <TrendingDown className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-foreground">No expenses recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Record utility disbursements, maintenance expenses, or salaries with bill attachments.
            </p>
          </div>
        )}
      </Card>

      {/* Record Expense Dialog */}
      <RecordExpenseDialog
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        mosqueId={mosqueId}
        funds={funds}
        accounts={accounts}
        categories={categories}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "expenses"] });
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "dashboard-report"] });
        }}
      />

      {/* Void Expense Dialog */}
      <VoidExpenseDialog
        isOpen={isVoidOpen}
        onClose={() => {
          setIsVoidOpen(false);
          setSelectedVoidExpense(null);
        }}
        mosqueId={mosqueId}
        expense={selectedVoidExpense}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "expenses"] });
          queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId, "dashboard-report"] });
        }}
      />
    </div>
  );
}

