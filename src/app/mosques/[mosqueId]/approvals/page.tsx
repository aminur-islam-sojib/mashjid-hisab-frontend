"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  Search,
  RotateCcw,
  Clock,
  Coins,
  TrendingDown,
  FileCheck,
  History,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useAuth } from "@/providers/auth-provider";
import { useMosque } from "@/providers/mosque-provider";
import { FINANCIAL_OPERATOR_ROLES } from "@/lib/roles";
import {
  UnifiedTransactionItem,
  PendingQueueResult,
} from "@/features/transactions/types";
import { TransactionDetailsModal } from "@/features/transactions/transaction-details-modal";
import { RejectTransactionDialog } from "@/features/transactions/reject-transaction-dialog";
import { VerifyCollectionDialog } from "@/features/collections/verify-collection-dialog";
import { CollectionSession, CollectionSessionsResponse } from "@/features/collections/types";
import { toast } from "sonner";

interface DelayedCommitItem {
  txId: string;
  secondsRemaining: number;
  timerId: NodeJS.Timeout;
  intervalId: NodeJS.Timeout;
}

export default function ApprovalsPage() {
  const params = useParams();
  const router = useRouter();
  const mosqueId = params["mosqueId"] as string;
  const { user, isLoading: isAuthLoading } = useAuth();
  const { canAccess } = useMosque();
  const queryClient = useQueryClient();

  // Role verification: only Admin and Treasurer
  const isApprover = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Filters
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  // Dialog states
  const [selectedTxId, setSelectedTxId] = React.useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [txToReject, setTxToReject] = React.useState<UnifiedTransactionItem | null>(null);
  const [selectedCollection, setSelectedCollection] = React.useState<CollectionSession | null>(null);

  // 5-second Delayed Commit state
  const [delayedCommits, setDelayedCommits] = React.useState<
    Record<string, DelayedCommitItem>
  >({});
  const delayedCommitsRef = React.useRef<Record<string, DelayedCommitItem>>({});
  delayedCommitsRef.current = delayedCommits;

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      Object.values(delayedCommitsRef.current).forEach((item) => {
        clearTimeout(item.timerId);
        clearInterval(item.intervalId);
      });
    };
  }, []);

  // Fetch pending queue
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery<PendingQueueResult>({
    queryKey: ["pending-transactions", mosqueId],
    queryFn: () =>
      apiClient.get<PendingQueueResult>(
        `/mosques/${mosqueId}/transactions/pending?limit=100`
      ),
    enabled: isApprover,
  });

  // Fetch open box counting sessions
  const {
    data: collectionsData,
    isLoading: isCollectionsLoading,
    refetch: refetchCollections,
  } = useQuery<CollectionSessionsResponse>({
    queryKey: ["collections", mosqueId, "OPEN"],
    queryFn: () =>
      apiClient.get<CollectionSessionsResponse>(
        `/mosques/${mosqueId}/collections?status=OPEN&limit=50`
      ),
    enabled: isApprover,
  });

  const pendingItems = pendingData?.items || [];
  const openCollections = collectionsData?.data || [];
  const totalPending = (pendingData?.totalPending || 0) + openCollections.length;
  const isDataLoading = isPendingLoading || isCollectionsLoading;

  const handleRefreshAll = () => {
    refetchPending();
    refetchCollections();
  };

  // Commit approval to backend
  const executeApprove = React.useCallback(
    async (txId: string) => {
      try {
        const idempotencyKey = `approve-${txId}-${Date.now()}`;
        await apiClient.post(
          `/mosques/${mosqueId}/transactions/${txId}/approve`,
          undefined,
          { idempotencyKey }
        );
        toast.success("Transaction approved and posted to ledger.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to approve transaction.");
      } finally {
        setDelayedCommits((prev) => {
          const next = { ...prev };
          delete next[txId];
          return next;
        });
        queryClient.invalidateQueries({ queryKey: ["pending-transactions", mosqueId] });
        queryClient.invalidateQueries({ queryKey: ["pending-count", mosqueId] });
        queryClient.invalidateQueries({ queryKey: ["transactions", mosqueId] });
        queryClient.invalidateQueries({ queryKey: ["mosque", mosqueId] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", mosqueId] });
      }
    },
    [mosqueId, queryClient]
  );

  // Start 5-second delayed commit for a single transaction
  const startDelayedCommit = (tx: UnifiedTransactionItem) => {
    const isSelfCreated = Boolean(
      user?.id && tx.createdById && user.id === tx.createdById
    );
    if (isSelfCreated) {
      toast.error("Self-approval is blocked by mosque policy.");
      return;
    }

    if (delayedCommitsRef.current[tx.id]) return;

    let secondsRemaining = 5;

    const intervalId = setInterval(() => {
      setDelayedCommits((prev) => {
        if (!prev[tx.id]) return prev;
        const updated = prev[tx.id].secondsRemaining - 1;
        if (updated <= 0) {
          clearInterval(prev[tx.id].intervalId);
          return prev;
        }
        return {
          ...prev,
          [tx.id]: {
            ...prev[tx.id],
            secondsRemaining: updated,
          },
        };
      });
    }, 1000);

    const timerId = setTimeout(() => {
      clearInterval(intervalId);
      executeApprove(tx.id);
    }, 5000);

    setDelayedCommits((prev) => ({
      ...prev,
      [tx.id]: {
        txId: tx.id,
        secondsRemaining,
        timerId,
        intervalId,
      },
    }));
  };

  // Undo delayed commit
  const cancelDelayedCommit = (txId: string) => {
    const existing = delayedCommitsRef.current[txId];
    if (existing) {
      clearTimeout(existing.timerId);
      clearInterval(existing.intervalId);
      setDelayedCommits((prev) => {
        const next = { ...prev };
        delete next[txId];
        return next;
      });
      toast.info("Approval cancelled.");
    }
  };

  // Bulk Approve for Donations only
  const eligibleDonations = React.useMemo(() => {
    return pendingItems.filter(
      (tx) =>
        tx.type === "DONATION" &&
        (!user?.id || user.id !== tx.createdById) &&
        !delayedCommits[tx.id]
    );
  }, [pendingItems, user?.id, delayedCommits]);

  const bulkDonationsTotal = React.useMemo(() => {
    return eligibleDonations.reduce((sum, tx) => sum + BigInt(tx.amount || "0"), 0n);
  }, [eligibleDonations]);

  const startBulkApproveDonations = () => {
    if (eligibleDonations.length === 0) return;
    toast.info(
      `Starting delayed commit for ${eligibleDonations.length} donations. You have 5 seconds to undo.`
    );
    eligibleDonations.forEach((tx) => {
      startDelayedCommit(tx);
    });
  };

  const cancelAllDelayedCommits = () => {
    Object.values(delayedCommitsRef.current).forEach((item) => {
      clearTimeout(item.timerId);
      clearInterval(item.intervalId);
    });
    setDelayedCommits({});
    toast.info("All delayed approvals cancelled.");
  };

  // Counts by type
  const countsByType = React.useMemo(() => {
    const res = {
      ALL: pendingItems.length + openCollections.length,
      DONATION: 0,
      EXPENSE: 0,
      COLLECTION: openCollections.length,
    };
    pendingItems.forEach((tx) => {
      if (tx.type === "DONATION") res.DONATION++;
      else if (tx.type === "EXPENSE") res.EXPENSE++;
    });
    return res;
  }, [pendingItems, openCollections]);

  // Filtered collections
  const filteredCollections = React.useMemo(() => {
    if (typeFilter !== "ALL" && typeFilter !== "COLLECTION") return [];
    return openCollections.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const occasion = s.occasion?.toLowerCase() || "";
        const notes = s.notes?.toLowerCase() || "";
        const creator = s.createdBy?.name?.toLowerCase() || "";
        if (!occasion.includes(q) && !notes.includes(q) && !creator.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [openCollections, typeFilter, search]);

  // Filtered transactions
  const filteredTransactions = React.useMemo(() => {
    if (typeFilter === "COLLECTION") return [];
    return pendingItems.filter((tx) => {
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const party = tx.party?.toLowerCase() || "";
        const notes = tx.notes?.toLowerCase() || "";
        const category = tx.categoryName?.toLowerCase() || "";
        const fund = tx.fundName?.toLowerCase() || "";
        const account = tx.accountName?.toLowerCase() || "";
        if (
          !party.includes(q) &&
          !notes.includes(q) &&
          !category.includes(q) &&
          !fund.includes(q) &&
          !account.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [pendingItems, typeFilter, search]);

  const totalFilteredCount = filteredCollections.length + filteredTransactions.length;
  const activeDelayedCount = Object.keys(delayedCommits).length;

  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 w-full bg-muted animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isApprover) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          The approvals queue is restricted to authorized financial officers (Mosque Admin and Treasurer).
        </p>
        <Button onClick={() => router.push(`/mosques/${mosqueId}/dashboard`)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dual-Control Approval Queue
            </h1>
            {totalPending > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                {totalPending} pending
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review staff entries, box counting sessions, and over-limit expenses before committing to ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/mosques/${mosqueId}/transactions`)}
            className="text-xs"
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            Master Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dual Control Governance Strip */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3.5 text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-sm">Segregation of Duties & Delayed Commit</p>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            Staff recordings and cash box counts require verification prior to ledger posting. Approving a transaction grants a{" "}
            <strong>5-second undo window</strong> before immutable posting. Self-approval is blocked by mosque policy.
          </p>
        </div>
      </div>

      {/* Bulk Approve Banner for Donations Only */}
      {eligibleDonations.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Bulk Approve: {eligibleDonations.length} Pending Donations
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(bulkDonationsTotal.toString())}</strong>.
                Expenses, collections, and over-limit items are excluded and must be reviewed individually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeDelayedCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={cancelAllDelayedCommits}
                className="text-xs border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Undo All ({activeDelayedCount})
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={startBulkApproveDonations}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Approve All {eligibleDonations.length} Donations
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
              typeFilter === "ALL"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({countsByType.ALL})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("DONATION")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
              typeFilter === "DONATION"
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Coins className="w-3 h-3" />
            Donations ({countsByType.DONATION})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("EXPENSE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
              typeFilter === "EXPENSE"
                ? "bg-rose-600 text-white font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            Expenses ({countsByType.EXPENSE})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("COLLECTION")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
              typeFilter === "COLLECTION"
                ? "bg-amber-600 text-white font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <FileCheck className="w-3 h-3" />
            Box Counts ({countsByType.COLLECTION})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search party, occasion, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Main Content: Card-Based Approval Queue */}
      {isDataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-muted rounded-md" />
                <div className="h-6 w-28 bg-muted rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded-md" />
                <div className="h-4 w-1/2 bg-muted rounded-md" />
              </div>
              <div className="h-9 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : totalFilteredCount === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            {countsByType.ALL === 0
              ? "All Clear! No Pending Approvals"
              : "No matching pending approvals"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {countsByType.ALL === 0
              ? "All transactions and cash box counting sessions recorded by staff and operators have been verified and posted to the master ledger."
              : "Try adjusting your search query or type filter to view pending entries."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Open Collection (Cash Box Count) Cards */}
          {filteredCollections.map((session) => {
            const isSelfCounted = Boolean(
              user?.id && session.createdBy?.id && user.id === session.createdBy.id
            );

            return (
              <div
                key={`collection-${session.id}`}
                className="bg-card rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-xs"
              >
                {/* Card Top: Type & Amount */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        <FileCheck className="w-3 h-3" /> Box Count
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(session.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Occasion */}
                  <div>
                    <p className="text-xs text-muted-foreground">Collection Occasion</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session.occasion}
                    </p>
                  </div>

                  {/* Status & Notice */}
                  <div className="text-xs bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Workflow</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px]">
                        Awaiting Verification
                      </span>
                    </div>
                  </div>

                  {/* Counted By */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="truncate">
                      <span className="text-muted-foreground">Cash Box Session</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-muted-foreground text-[11px]">Counted by: </span>
                      <span className="font-medium text-foreground">
                        {session.createdBy?.name || "Staff Officer"}
                      </span>
                      {isSelfCounted && (
                        <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md mt-0.5">
                          Self-Counted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes if any */}
                  {session.notes && (
                    <div className="text-xs text-muted-foreground italic bg-background/50 p-2 rounded-lg border border-border/40">
                      "{session.notes}"
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Two-person verification required
                  </span>

                  <Button
                    size="sm"
                    className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    disabled={isSelfCounted}
                    title={
                      isSelfCounted
                        ? "Self-verification is blocked by dual-control policy"
                        : "Verify cash count & post income"
                    }
                    onClick={() => setSelectedCollection(session)}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Verify & Post
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Pending Staff Transactions */}
          {filteredTransactions.map((tx) => {
            const isSelfCreated = Boolean(
              user?.id && tx.createdById && user.id === tx.createdById
            );
            const delayedCommit = delayedCommits[tx.id];
            const isCommitting = Boolean(delayedCommit);

            return (
              <div
                key={tx.id}
                className={`bg-card rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isCommitting
                    ? "border-amber-500/60 bg-amber-500/5 shadow-md ring-2 ring-amber-500/20"
                    : "border-border hover:border-primary/30 hover:shadow-xs"
                }`}
              >
                {/* 5-second Delayed Commit Banner Overlay */}
                {isCommitting && (
                  <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                      <span>
                        Approved! Committing to ledger in{" "}
                        <strong className="font-bold text-amber-700 dark:text-amber-300">
                          {delayedCommit.secondsRemaining}s
                        </strong>
                        ...
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelDelayedCommit(tx.id)}
                      className="h-7 px-3 text-xs border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Undo
                    </Button>
                  </div>
                )}

                {/* Card Top: Type & Amount */}
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {tx.type === "DONATION" ? (
                        <Badge variant="success" className="gap-1">
                          <Coins className="w-3 h-3" /> Donation
                        </Badge>
                      ) : tx.type === "EXPENSE" ? (
                        <Badge variant="danger" className="gap-1">
                          <TrendingDown className="w-3 h-3" /> Expense
                        </Badge>
                      ) : (
                        <Badge variant="info" className="gap-1">
                          <History className="w-3 h-3" /> Transfer
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          tx.type === "DONATION"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "EXPENSE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-sky-600 dark:text-sky-400"
                        }`}
                      >
                        {formatCurrency(tx.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Party / Vendor */}
                  <div>
                    <p className="text-xs text-muted-foreground">Party / Payee / Donor</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tx.party || "General / Anonymous"}
                    </p>
                  </div>

                  {/* Fund & Account Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/50">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Fund</span>
                      <span className="font-medium text-foreground truncate block">
                        {tx.fundName || "General Fund"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Account</span>
                      <span className="font-medium text-foreground truncate block">
                        {tx.accountName || "Main Account"}
                      </span>
                    </div>
                  </div>

                  {/* Category & Recorded By */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="truncate">
                      {tx.categoryName && (
                        <span className="text-muted-foreground">
                          Category: <span className="text-foreground font-medium">{tx.categoryName}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-muted-foreground text-[11px]">Recorded by: </span>
                      <span className="font-medium text-foreground">
                        {tx.createdBy?.name || "Staff Officer"}
                      </span>
                      {isSelfCreated && (
                        <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md mt-0.5">
                          Self-Created
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes if any */}
                  {tx.notes && (
                    <div className="text-xs text-muted-foreground italic bg-background/50 p-2 rounded-lg border border-border/40">
                      "{tx.notes}"
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-primary hover:bg-primary/10"
                    onClick={() => {
                      setSelectedTxId(tx.id);
                      setIsDetailOpen(true);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Details
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      disabled={isCommitting}
                      onClick={() => setTxToReject(tx)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>

                    <Button
                      size="sm"
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      disabled={isCommitting || isSelfCreated}
                      title={
                        isSelfCreated
                          ? "Self-approval is blocked by mosque policy"
                          : "Approve transaction (5-second undo)"
                      }
                      onClick={() => startDelayedCommit(tx)}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTxId(null);
        }}
        mosqueId={mosqueId}
        transactionId={selectedTxId}
        onApprove={
          isApprover
            ? (tx) => {
                setIsDetailOpen(false);
                startDelayedCommit(tx);
              }
            : undefined
        }
        onReject={
          isApprover
            ? (tx) => {
                setIsDetailOpen(false);
                setTxToReject(tx);
              }
            : undefined
        }
      />

      {/* Reject Reason Dialog */}
      <RejectTransactionDialog
        isOpen={Boolean(txToReject)}
        onClose={() => setTxToReject(null)}
        mosqueId={mosqueId}
        transaction={txToReject}
      />

      {/* Box Count Verification Dialog */}
      <VerifyCollectionDialog
        isOpen={Boolean(selectedCollection)}
        onClose={() => {
          setSelectedCollection(null);
          refetchCollections();
          refetchPending();
        }}
        mosqueId={mosqueId}
        session={selectedCollection}
      />
    </div>
  );
}

