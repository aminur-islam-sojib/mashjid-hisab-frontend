"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useAuth } from "@/providers/auth-provider";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import {
  UnifiedTransactionItem,
  CursorPaginatedTransactions,
  PendingQueueResult,
} from "@/features/transactions/types";
import { TransactionDetailsModal } from "@/features/transactions/transaction-details-modal";
import { ApproveTransactionDialog } from "@/features/transactions/approve-transaction-dialog";
import { RejectTransactionDialog } from "@/features/transactions/reject-transaction-dialog";

export default function TransactionsPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { user } = useAuth();
  const { canAccess } = useMosque();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<"ledger" | "pending">("ledger");

  // Ledger Filter State
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
  const [txToApprove, setTxToApprove] = React.useState<UnifiedTransactionItem | null>(null);
  const [txToReject, setTxToReject] = React.useState<UnifiedTransactionItem | null>(null);

  // Can approve/reject check: MOSQUE_ADMIN or TREASURER
  const isApprover = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Fetch Accounts and Funds for filter dropdowns
  const { data: accountsData } = useQuery({
    queryKey: ["accounts", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/accounts`),
  });

  const { data: fundsData } = useQuery({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
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
    enabled: activeTab === "ledger",
  });

  // Fetch Pending Queue
  const { data: pendingData, isLoading: isPendingLoading } = useQuery<PendingQueueResult>({
    queryKey: ["pending-transactions", mosqueId],
    queryFn: () =>
      apiClient.get<PendingQueueResult>(
        `/mosques/${mosqueId}/transactions/pending?limit=50`
      ),
    enabled: isApprover,
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
        return <Badge variant="success">Posted</Badge>;
      case "PENDING":
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      case "VOIDED":
        return <Badge variant="secondary">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "DONATION":
      case "INCOME":
        return <Badge variant="success">Donation</Badge>;
      case "EXPENSE":
        return <Badge variant="danger">Expense</Badge>;
      case "TRANSFER":
        return <Badge variant="info">Transfer</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Master Financial Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Immutable single-source-of-truth transaction log across all funds and accounts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === "ledger"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Master Ledger</span>
          </button>

          {isApprover && (
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                activeTab === "pending"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Approval Queue</span>
              {pendingCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Master Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search party or ref..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCursor(undefined);
                    setCursorHistory([]);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
                >
                  <option value="">All Statuses</option>
                  <option value="POSTED">Posted</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="VOIDED">Voided</option>
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
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
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
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
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isLedgerLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading master ledger entries...
              </div>
            ) : !ledgerData?.items || ledgerData.items.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No transactions recorded</p>
                <p className="text-xs text-gray-400 mt-1">
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
                    <Th>Account</Th>
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
                        <Td className="whitespace-nowrap font-medium text-gray-700">
                          {new Date(tx.date).toLocaleDateString()}
                        </Td>
                        <Td className="font-mono text-xs text-gray-600">
                          {tx.transactionNumber || "Pending"}
                        </Td>
                        <Td>{getTypeBadge(tx.type)}</Td>
                        <Td className="text-gray-900 font-medium">
                          {tx.party || "—"}
                        </Td>
                        <Td className="text-gray-600 text-xs">
                          {tx.fundName || "General Fund"}
                          {tx.toFundName && (
                            <span className="text-[#006B5B] block font-medium">
                              ↳ {tx.toFundName}
                            </span>
                          )}
                        </Td>
                        <Td className="text-gray-600 text-xs">
                          {tx.accountName || "Main Account"}
                          {tx.toAccountName && (
                            <span className="text-[#006B5B] block font-medium">
                              ↳ {tx.toAccountName}
                            </span>
                          )}
                        </Td>
                        <Td
                          className={`text-right font-bold whitespace-nowrap ${
                            isPositive
                              ? "text-emerald-700"
                              : isNegative
                              ? "text-red-700"
                              : "text-indigo-700"
                          }`}
                        >
                          {isPositive ? "+" : isNegative ? "-" : ""}
                          {formatCurrency(tx.amount)}
                        </Td>
                        <Td>{getStatusBadge(tx.status)}</Td>
                        <Td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[#006B5B] hover:bg-[#E6F4F0]"
                            onClick={() => {
                              setSelectedTxId(tx.id);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Timeline
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}

            {/* Pagination Controls */}
            {ledgerData && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Showing {ledgerData.items.length} records (Limit: {ledgerData.pagination.limit})
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={cursorHistory.length === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!ledgerData.pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Approval Queue */}
      {activeTab === "pending" && isApprover && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start space-x-3 text-amber-900 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Dual-Control Approval Queue</p>
              <p className="text-amber-800 text-xs mt-0.5">
                Staff entries and over-limit expenses remain pending here until verified and approved
                by a separate authorized official. Self-approval is strictly prevented by mosque policy.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            {isPendingLoading ? (
              <div className="py-16 text-center text-gray-500">
                Loading pending approval queue...
              </div>
            ) : !pendingData?.items || pendingData.items.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">Approval queue is empty</p>
                <p className="text-xs text-gray-400 mt-1">
                  All recorded transactions have been approved and posted.
                </p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Party / Vendor</Th>
                    <Th>Fund / Account</Th>
                    <Th>Recorded By</Th>
                    <Th>Notes</Th>
                    <Th className="text-right">Review Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingData.items.map((tx) => {
                    const isSelfCreated =
                      Boolean(user?.id && tx.createdById && user.id === tx.createdById);

                    return (
                      <Tr key={tx.id}>
                        <Td className="whitespace-nowrap font-medium text-gray-700">
                          {new Date(tx.date).toLocaleDateString()}
                        </Td>
                        <Td>{getTypeBadge(tx.type)}</Td>
                        <Td className="font-bold text-[#006B5B] whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </Td>
                        <Td className="font-medium text-gray-900">{tx.party || "—"}</Td>
                        <Td className="text-xs text-gray-600">
                          <div>Fund: {tx.fundName || "General Fund"}</div>
                          <div>Acct: {tx.accountName || "Main Account"}</div>
                        </Td>
                        <Td className="text-xs text-gray-700">
                          <span className="font-medium">
                            {tx.createdBy?.name || "Staff Officer"}
                          </span>
                          {isSelfCreated && (
                            <span className="block text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                              Self-Created
                            </span>
                          )}
                        </Td>
                        <Td className="text-xs text-gray-500 max-w-[200px] truncate">
                          {tx.notes || "—"}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                              onClick={() => setTxToReject(tx)}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs bg-[#006B5B] hover:bg-[#005246] text-white"
                              disabled={isSelfCreated}
                              title={
                                isSelfCreated
                                  ? "Self-approval is blocked by policy"
                                  : "Approve transaction"
                              }
                              onClick={() => setTxToApprove(tx)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* Transaction Timeline Detail Modal */}
      <TransactionDetailsModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTxId(null);
        }}
        mosqueId={mosqueId}
        transactionId={selectedTxId}
      />

      {/* Approve Dialog */}
      <ApproveTransactionDialog
        isOpen={Boolean(txToApprove)}
        onClose={() => setTxToApprove(null)}
        mosqueId={mosqueId}
        transaction={txToApprove}
      />

      {/* Reject Dialog */}
      <RejectTransactionDialog
        isOpen={Boolean(txToReject)}
        onClose={() => setTxToReject(null)}
        mosqueId={mosqueId}
        transaction={txToReject}
      />
    </div>
  );
}
