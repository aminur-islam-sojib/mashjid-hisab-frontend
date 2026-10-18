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
  TrendingUp,
  FileCheck,
  History,
  Check,
  Wallet,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
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
import {
  CollectionSession,
  CollectionSessionsResponse,
} from "@/features/collections/types";
import { toast } from "sonner";

interface DelayedCommitItem {
  txId: string;
  secondsRemaining: number;
  timerId: NodeJS.Timeout;
  intervalId: NodeJS.Timeout;
}

export interface UnifiedApprovalRow {
  id: string;
  sourceType: "TRANSACTION" | "COLLECTION";
  transactionType: "DONATION" | "EXPENSE" | "TRANSFER" | "INCOME" | "COLLECTION";
  title: string;
  subtitle?: string;
  amount: string; // poisha string
  fundName: string;
  accountName: string;
  categoryName?: string;
  createdByName: string;
  createdById?: string | null;
  date: string;
  rawTransaction?: UnifiedTransactionItem;
  rawCollection?: CollectionSession;
}

export function ApprovalsView({ mosqueId }: { mosqueId: string }) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { canAccess } = useMosque();
  const queryClient = useQueryClient();

  // Role verification: only Admin and Treasurer
  const isApprover = canAccess(FINANCIAL_OPERATOR_ROLES);

  // Filters & Search State
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [ownerFilter, setOwnerFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<"LATEST" | "OLDEST" | "AMOUNT_DESC" | "AMOUNT_ASC">("LATEST");

  // Pagination State (matching reference layout)
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  // Dialog States
  const [selectedTxId, setSelectedTxId] = React.useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [txToReject, setTxToReject] = React.useState<UnifiedTransactionItem | null>(null);
  const [selectedCollection, setSelectedCollection] = React.useState<CollectionSession | null>(null);

  // 5-second Delayed Commit state
  const [delayedCommits, setDelayedCommits] = React.useState<Record<string, DelayedCommitItem>>({});
  const delayedCommitsRef = React.useRef<Record<string, DelayedCommitItem>>({});
  delayedCommitsRef.current = delayedCommits;

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      Object.values(delayedCommitsRef.current).forEach((item) => {
        clearTimeout(item.timerId);
        clearInterval(item.intervalId);
      });
    };
  }, []);

  // Fetch pending transactions queue
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery<PendingQueueResult>({
    queryKey: ["pending-transactions", mosqueId],
    queryFn: () =>
      apiClient.get<PendingQueueResult>(
        `/mosques/${mosqueId}/transactions/pending?limit=150`
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
  const isDataLoading = isPendingLoading || isCollectionsLoading;

  const handleRefreshAll = () => {
    refetchPending();
    refetchCollections();
    toast.info("Approvals queue refreshed.");
  };

  // Commit approval to backend after 5s delayed timer completes
  const executeApprove = React.useCallback(
    async (txId: string) => {
      try {
        const idempotencyKey = `approve-${txId}-${Date.now()}`;
        await apiClient.post(
          `/mosques/${mosqueId}/transactions/${txId}/approve`,
          undefined,
          { idempotencyKey }
        );
        toast.success("Transaction approved and posted to master ledger.");
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

  // Start 5-second delayed commit
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

  // Bulk Approve for eligible Donations
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

  // Normalize all queue items into unified rows
  const allRows: UnifiedApprovalRow[] = React.useMemo(() => {
    const rows: UnifiedApprovalRow[] = [];

    // Collections
    openCollections.forEach((c) => {
      rows.push({
        id: `collection-${c.id}`,
        sourceType: "COLLECTION",
        transactionType: "COLLECTION",
        title: c.occasion || "Cash Box Counting",
        subtitle: c.notes || "Counted box collection session",
        amount: c.totalAmount,
        fundName: c.fund?.name || "General Fund",
        accountName: c.account?.name || "Cash Drawer",
        categoryName: "Cash Box Session",
        createdByName: c.createdBy?.name || "Staff Member",
        createdById: c.createdBy?.id || null,
        date: c.date,
        rawCollection: c,
      });
    });

    // Transactions
    pendingItems.forEach((tx) => {
      rows.push({
        id: tx.id,
        sourceType: "TRANSACTION",
        transactionType: tx.type,
        title:
          tx.party ||
          (tx.type === "DONATION"
            ? "Anonymous Donor"
            : tx.type === "EXPENSE"
            ? "General Operational Expense"
            : "Fund Transfer"),
        subtitle: tx.notes || (tx.transactionNumber ? `#${tx.transactionNumber}` : undefined),
        amount: tx.amount,
        fundName: tx.fundName || "General Fund",
        accountName: tx.accountName || "Main Account",
        categoryName: tx.categoryName || (tx.type === "TRANSFER" ? "Account Transfer" : "Uncategorized"),
        createdByName: tx.createdBy?.name || "Staff Member",
        createdById: tx.createdById,
        date: tx.date,
        rawTransaction: tx,
      });
    });

    return rows;
  }, [openCollections, pendingItems]);

  // Aggregate Metrics for Top 4 KPI Cards (Matching Reference Layout)
  const kpis = React.useMemo(() => {
    let totalPoisha = 0n;
    let donationPoisha = 0n;
    let expensePoisha = 0n;
    let donationCount = 0;
    let expenseCount = 0;
    let collectionCount = openCollections.length;

    allRows.forEach((row) => {
      const amt = BigInt(row.amount || "0");
      totalPoisha += amt;
      if (row.transactionType === "DONATION") {
        donationPoisha += amt;
        donationCount++;
      } else if (row.transactionType === "EXPENSE") {
        expensePoisha += amt;
        expenseCount++;
      }
    });

    return {
      totalCount: allRows.length,
      totalVolume: totalPoisha,
      donationCount,
      donationVolume: donationPoisha,
      expenseCount,
      expenseVolume: expensePoisha,
      collectionCount,
    };
  }, [allRows, openCollections]);

  // Distinct creators for Owner filter dropdown
  const distinctOwners = React.useMemo(() => {
    const map = new Map<string, string>();
    allRows.forEach((r) => {
      if (r.createdByName) map.set(r.createdByName, r.createdByName);
    });
    return Array.from(map.values());
  }, [allRows]);

  // Filtered & Sorted Rows
  const filteredAndSortedRows = React.useMemo(() => {
    let list = allRows.filter((row) => {
      // Type Filter
      if (typeFilter !== "ALL" && row.transactionType !== typeFilter) {
        return false;
      }
      // Owner Filter
      if (ownerFilter !== "ALL" && row.createdByName !== ownerFilter) {
        return false;
      }
      // Status Filter
      if (statusFilter === "IN_DELAY") {
        if (!delayedCommits[row.id]) return false;
      } else if (statusFilter === "PENDING") {
        if (delayedCommits[row.id]) return false;
      }
      // Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = row.title.toLowerCase().includes(q);
        const subMatch = (row.subtitle || "").toLowerCase().includes(q);
        const fundMatch = row.fundName.toLowerCase().includes(q);
        const acctMatch = row.accountName.toLowerCase().includes(q);
        const catMatch = (row.categoryName || "").toLowerCase().includes(q);
        const ownerMatch = row.createdByName.toLowerCase().includes(q);
        if (!titleMatch && !subMatch && !fundMatch && !acctMatch && !catMatch && !ownerMatch) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "LATEST") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "OLDEST") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "AMOUNT_DESC") {
        return Number(BigInt(b.amount || "0") - BigInt(a.amount || "0"));
      }
      if (sortBy === "AMOUNT_ASC") {
        return Number(BigInt(a.amount || "0") - BigInt(b.amount || "0"));
      }
      return 0;
    });

    return list;
  }, [allRows, typeFilter, ownerFilter, statusFilter, search, sortBy, delayedCommits]);

  // Reset pagination when filter criteria change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, ownerFilter, statusFilter, sortBy]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRows.length / itemsPerPage));
  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRows.slice(start, start + itemsPerPage);
  }, [filteredAndSortedRows, currentPage, itemsPerPage]);

  const activeDelayedCount = Object.keys(delayedCommits).length;

  // CSV Export Function (Matching Reference Export button)
  const handleExportCSV = () => {
    if (filteredAndSortedRows.length === 0) {
      toast.error("No items to export in current filter view.");
      return;
    }

    const headers = [
      "ID",
      "Type",
      "Title/Party",
      "Subtitle/Notes",
      "Amount (Poisha)",
      "Fund",
      "Account",
      "Category",
      "Recorded By",
      "Date",
    ];

    const csvRows = filteredAndSortedRows.map((r) => [
      `"${r.id}"`,
      `"${r.transactionType}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${(r.subtitle || "").replace(/"/g, '""')}"`,
      `"${r.amount}"`,
      `"${r.fundName}"`,
      `"${r.accountName}"`,
      `"${r.categoryName || ""}"`,
      `"${r.createdByName}"`,
      `"${r.date}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `pending-approvals-${mosqueId}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Pending approvals exported to CSV.");
  };

  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-2xl" />
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
    <div className="space-y-6 pb-8">
      {/* 1. Header Section (Matching Reference Page Title & Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Approvals Queue
            </h1>
            {kpis.totalCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                {kpis.totalCount} awaiting signoff
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and track pending recordings, donations, and cash collections awaiting dual-control verification.
          </p>
        </div>

        {/* Right Header Action Buttons (Matching Export & Primary Button) */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs rounded-xl font-medium shadow-2xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/mosques/${mosqueId}/transactions`)}
            className="text-xs rounded-xl font-medium shadow-2xs gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-muted-foreground" />
            Master Ledger
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="text-xs rounded-xl font-medium shadow-2xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Row of 4 Cards - Matching Reference Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Pending */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#006B5B] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
              {kpis.totalCount}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Dual Control
              </span>
              <span className="text-xs text-muted-foreground">needs verification</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Volume (Pipeline Value) */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#006B5B] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
              {formatCurrency(kpis.totalVolume.toString())}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                100% poisha exact
              </span>
              <span className="text-xs text-muted-foreground">pending ledger</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Income (Won Deals in ref) */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
              {kpis.donationCount + kpis.collectionCount}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {formatCurrency(kpis.donationVolume.toString())}
              </span>
              <span className="text-xs text-muted-foreground">donations & boxes</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Expenses (Win Rate in ref) */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-foreground tracking-tight">
              {kpis.expenseCount}
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {formatCurrency(kpis.expenseVolume.toString())}
              </span>
              <span className="text-xs text-muted-foreground">treasurer signoff</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Delayed Commit Sticky Alert Bar (when any approval is in 5s grace window) */}
      {activeDelayedCount > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>
              <strong>{activeDelayedCount} transaction(s)</strong> committing to ledger. You have a 5-second undo grace period.
            </span>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={cancelAllDelayedCommits}
            className="border-amber-600 text-amber-700 dark:text-amber-300 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Undo All ({activeDelayedCount})
          </Button>
        </div>
      )}

      {/* 4. Filter and Search Bar (Matching Reference Controls Row) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input on Left */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search deals, party, occasion, fund, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* Dropdown Filters on Right (Matching Stage ⌵, Owner ⌵, Status ⌵, Filter in Reference) */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Stage / Type Dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Stage: All Types</option>
              <option value="DONATION">● Donations ({kpis.donationCount})</option>
              <option value="EXPENSE">● Expenses ({kpis.expenseCount})</option>
              <option value="COLLECTION">● Box Counts ({kpis.collectionCount})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Owner / Creator Dropdown */}
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Owner: All</option>
              {distinctOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Status: All</option>
              <option value="PENDING">Pending Signoff</option>
              <option value="IN_DELAY">In 5s Grace Period</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Icon Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setOwnerFilter("ALL");
              setStatusFilter("ALL");
              setSortBy("LATEST");
            }}
            title="Reset Filters"
            className="h-8.5 w-8.5 p-0 rounded-xl border border-border bg-card hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 5. Main Card Container with Table (Matching "All Deals" Card in Reference) */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {/* Table Top Header Bar (Matching All Deals + Sort By in Reference) */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-foreground font-heading">
              All Pending Items
            </h2>
            <Badge variant="outline" className="text-xs font-semibold py-0.5">
              {filteredAndSortedRows.length} {filteredAndSortedRows.length === 1 ? "Item" : "Items"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Bulk Action for Donations if available */}
            {eligibleDonations.length > 0 && activeDelayedCount === 0 && (
              <Button
                size="xs"
                onClick={startBulkApproveDonations}
                className="bg-[#006B5B] hover:bg-[#005246] text-white text-xs rounded-lg gap-1.5 font-medium shadow-2xs"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Approve All {eligibleDonations.length} Donations ({formatCurrency(bulkDonationsTotal.toString())})
              </Button>
            )}

            {/* Sort Dropdown (Matching "Sort by: Latest ⌵") */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-2 pr-6 py-1 text-xs rounded-lg border border-border bg-background text-foreground font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="LATEST">Latest</option>
                  <option value="OLDEST">Oldest</option>
                  <option value="AMOUNT_DESC">Amount: High to Low</option>
                  <option value="AMOUNT_ASC">Amount: Low to High</option>
                </select>
                <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        {isDataLoading ? (
          <div className="py-20 text-center space-y-3">
            <Clock className="w-8 h-8 text-[#006B5B] animate-spin mx-auto opacity-70" />
            <p className="text-xs text-muted-foreground">Loading pending items...</p>
          </div>
        ) : filteredAndSortedRows.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h3 className="text-base font-semibold text-foreground">
              {kpis.totalCount === 0
                ? "All Clear! No Pending Approvals"
                : "No matching pending approvals"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {kpis.totalCount === 0
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
                {paginatedRows.map((row) => {
                  const isDelayed = Boolean(delayedCommits[row.id]);
                  const delayItem = delayedCommits[row.id];
                  const isSelfCreated = Boolean(
                    user?.id && row.createdById && user.id === row.createdById
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
                              onClick={() => cancelDelayedCommit(row.id)}
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
                                onClick={() => {
                                  setSelectedTxId(row.id);
                                  setIsDetailOpen(true);
                                }}
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
                                onClick={() => setTxToReject(row.rawTransaction!)}
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
                                onClick={() => setSelectedCollection(row.rawCollection!)}
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
                                onClick={() => startDelayedCommit(row.rawTransaction!)}
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

        {/* 6. Bottom Pagination Bar (Matching Reference Layout << < 1 2 3 > >>) */}
        {!isDataLoading && filteredAndSortedRows.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
            <div className="text-xs text-muted-foreground">
              Showing{" "}
              <strong className="text-foreground font-semibold">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground font-semibold">
                {Math.min(currentPage * itemsPerPage, filteredAndSortedRows.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-foreground font-semibold">
                {filteredAndSortedRows.length}
              </strong>{" "}
              pending items
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1 self-center sm:self-auto">
              {/* First Page */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg text-xs"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>

              {/* Prev Page */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Show pages around current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      size="xs"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 rounded-lg text-xs font-semibold ${
                        currentPage === pageNum
                          ? "bg-[#006B5B] hover:bg-[#005246] text-white"
                          : "text-foreground"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="px-1 text-xs text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              {/* Next Page */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg text-xs"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
