"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  ArrowRight,
  ShieldAlert,
  Eye,
  CheckSquare,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import {
  CursorPaginatedTransactions,
  PendingQueueResult,
} from "../types";
import { TransactionDetailsModal } from "../transaction-details-modal";

export function TransactionsView({ mosqueId }: { mosqueId: string }) {
  const router = useRouter();
  const { canAccess } = useMosque();

  // Filter State
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [fundFilter, setFundFilter] = React.useState<string>("");
  const [accountFilter, setAccountFilter] = React.useState<string>("");
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([]);

  // Dialog State
  const [selectedTxId, setSelectedTxId] = React.useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Can approve/reject check: MOSQUE_ADMIN or TREASURER
  const isApprover = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Fetch Accounts and Funds for filter dropdowns
  const { data: accountsData } = useQuery({
    queryKey: ["accounts", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/accounts`),
    enabled: Boolean(mosqueId),
  });

  const { data: fundsData } = useQuery({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
    enabled: Boolean(mosqueId),
  });

  // Fetch Ledger (cursor paginated)
  const { data: ledgerData, isLoading: isLedgerLoading } = useQuery<CursorPaginatedTransactions>({
    queryKey: [
      "transactions",
      mosqueId,
      cursor,
      search,
      typeFilter,
      statusFilter,
      fundFilter,
      accountFilter,
    ],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.append("limit", "25");
      if (cursor) p.append("cursor", cursor);
      if (search.trim()) p.append("search", search.trim());
      if (typeFilter) p.append("type", typeFilter);
      if (statusFilter) p.append("status", statusFilter);
      if (fundFilter) p.append("fundId", fundFilter);
      if (accountFilter) p.append("accountId", accountFilter);

      return apiClient.get<CursorPaginatedTransactions>(
        `/mosques/${mosqueId}/transactions?${p.toString()}`
      );
    },
    enabled: Boolean(mosqueId),
  });

  // Fetch Pending Queue
  const { data: pendingData } = useQuery<PendingQueueResult>({
    queryKey: ["pending-transactions", mosqueId],
    queryFn: () =>
      apiClient.get<PendingQueueResult>(
        `/mosques/${mosqueId}/transactions/pending?limit=50`
      ),
    enabled: Boolean(mosqueId) && isApprover,
  });

  const pendingCount = pendingData?.totalPending || 0;

  const handleNextPage = () => {
    if (ledgerData?.pagination.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor || ""]);
      setCursor(ledgerData.pagination.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const prevCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCursor(prevCursor || undefined);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "POSTED":
        return <Badge variant="success" className="text-[10px]">Posted</Badge>;
      case "PENDING":
      case "PENDING_APPROVAL":
        return <Badge variant="warning" className="text-[10px]">Waiting for approval</Badge>;
      case "REJECTED":
        return <Badge variant="danger" className="text-[10px]">Rejected</Badge>;
      case "VOIDED":
        return <Badge variant="secondary" className="text-[10px]">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "DONATION":
      case "INCOME":
        return <Badge variant="success" className="text-[10px]">Donation</Badge>;
      case "EXPENSE":
        return <Badge variant="danger" className="text-[10px]">Expense</Badge>;
      case "TRANSFER":
        return <Badge variant="info" className="text-[10px]">Transfer</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            All Transactions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single-source-of-truth transaction log across all funds and cash & bank accounts.
          </p>
        </div>

        {/* Approvals Action Shortcut */}
        {isApprover && pendingCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/mosques/${mosqueId}/approvals`)}
            className="flex items-center gap-2 text-xs"
          >
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>Waiting for approval</span>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-full">
              {pendingCount}
            </span>
          </Button>
        )}
      </div>

      {/* Pending Items Notice in Ledger */}
      {pendingCount > 0 && isApprover && (
        <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-100 text-xs shadow-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingCount} transaction{pendingCount > 1 ? "s" : ""}</strong> waiting for dual-control approval.
            </span>
          </div>
          <Button
            size="xs"
            variant="outline"
            className="border-amber-300 text-amber-900 dark:text-amber-100 shrink-0 font-medium"
            onClick={() => router.push(`/mosques/${mosqueId}/approvals`)}
          >
            Review Approval Queue
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search party or ref..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Types</option>
              <option value="DONATION">Donation</option>
              <option value="EXPENSE">Expense</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="POSTED">Posted</option>
              <option value="PENDING">Waiting for approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="VOIDED">Cancelled</option>
            </select>
          </div>

          {/* Fund */}
          <div>
            <select
              value={fundFilter}
              onChange={(e) => {
                setFundFilter(e.target.value);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Funds</option>
              {fundsData?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <select
              value={accountFilter}
              onChange={(e) => {
                setAccountFilter(e.target.value);
                setCursor(undefined);
                setCursorHistory([]);
              }}
              className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Accounts</option>
              {accountsData?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {isLedgerLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading transactions...
          </div>
        ) : !ledgerData?.items || ledgerData.items.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <History className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
            <p className="font-semibold text-sm text-foreground">No transactions recorded</p>
            <p className="text-xs text-muted-foreground">
              Adjust filters or record donations/expenses to populate the ledger.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Reference #</Th>
                <Th>Type</Th>
                <Th>Party / Counterpart</Th>
                <Th>Fund</Th>
                <Th>Cash & Bank</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {ledgerData.items.map((tx) => {
                const isPositive = tx.type === "DONATION" || tx.type === "INCOME";
                const isNegative = tx.type === "EXPENSE";

                return (
                  <Tr key={tx.id}>
                    <Td className="whitespace-nowrap font-medium text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {tx.transactionNumber || "Pending"}
                    </Td>
                    <Td>{getTypeBadge(tx.type)}</Td>
                    <Td className="text-foreground font-medium text-xs">
                      {tx.party || "—"}
                    </Td>
                    <Td className="text-muted-foreground text-xs">
                      {tx.fundName || "General Fund"}
                      {tx.toFundName && (
                        <span className="text-primary block font-medium">
                          ↳ {tx.toFundName}
                        </span>
                      )}
                    </Td>
                    <Td className="text-muted-foreground text-xs">
                      {tx.accountName || "Main Account"}
                      {tx.toAccountName && (
                        <span className="text-primary block font-medium">
                          ↳ {tx.toAccountName}
                        </span>
                      )}
                    </Td>
                    <Td
                      className={`text-right font-bold text-xs whitespace-nowrap ${
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isNegative
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-primary"
                      }`}
                    >
                      {isPositive ? "+" : isNegative ? "-" : ""}
                      {formatCurrency(tx.amount)}
                    </Td>
                    <Td>{getStatusBadge(tx.status)}</Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setSelectedTxId(tx.id);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}

        {/* Pagination Controls */}
        {ledgerData && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing {ledgerData.items.length} records (Limit: {ledgerData.pagination.limit})
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={handleNextPage}
                disabled={!ledgerData.pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Timeline Detail Modal */}
      <TransactionDetailsModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTxId(null);
        }}
        mosqueId={mosqueId}
        transactionId={selectedTxId}
        onApprove={isApprover ? () => router.push(`/mosques/${mosqueId}/approvals`) : undefined}
        onReject={isApprover ? () => router.push(`/mosques/${mosqueId}/approvals`) : undefined}
      />
    </div>
  );
}

