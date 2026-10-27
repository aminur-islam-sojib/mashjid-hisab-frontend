"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
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

import {
  ApprovalTypeFilter,
  ApprovalStatusFilter,
  ApprovalSortOption,
  DelayedCommitItem,
  UnifiedApprovalRow,
  ApprovalKpis,
} from "./types";
import { ApprovalsHeader } from "./components/approvals-header";
import { ApprovalsKpiCards } from "./components/approvals-kpi-cards";
import { ApprovalsDelayedBanner } from "./components/approvals-delayed-banner";
import { ApprovalsToolbar } from "./components/approvals-toolbar";
import { ApprovalsTable } from "./components/approvals-table";

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
  const [sortBy, setSortBy] = React.useState<ApprovalSortOption>("LATEST");

  // Pagination State
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

  // Aggregate Metrics for Top 4 KPI Cards
  const kpis: ApprovalKpis = React.useMemo(() => {
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
      if (typeFilter !== "ALL" && row.transactionType !== typeFilter) {
        return false;
      }
      if (ownerFilter !== "ALL" && row.createdByName !== ownerFilter) {
        return false;
      }
      if (statusFilter === "IN_DELAY") {
        if (!delayedCommits[row.id]) return false;
      } else if (statusFilter === "PENDING") {
        if (delayedCommits[row.id]) return false;
      }
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

  // CSV Export Function
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
      {/* 1. Header Section */}
      <ApprovalsHeader
        totalPending={kpis.totalCount}
        onExport={handleExportCSV}
        onNavigateToMasterLedger={() => router.push(`/mosques/${mosqueId}/transactions`)}
        onRefresh={handleRefreshAll}
      />

      {/* 2. Top Metric KPI Cards */}
      <ApprovalsKpiCards kpis={kpis} />

      {/* 3. Delayed Commit Sticky Alert Bar */}
      <ApprovalsDelayedBanner
        activeDelayedCount={activeDelayedCount}
        onCancelAll={cancelAllDelayedCommits}
      />

      {/* 4. Filter and Search Controls Toolbar */}
      {/* <ApprovalsToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        distinctOwners={distinctOwners}
        kpis={kpis}
        onResetFilters={() => {
          setSearch("");
          setTypeFilter("ALL");
          setOwnerFilter("ALL");
          setStatusFilter("ALL");
          setSortBy("LATEST");
        }}
      /> */}

      {/* 5. Main Card Container with Table & Pagination */}
      <ApprovalsTable
        rows={paginatedRows}
        totalFilteredCount={filteredAndSortedRows.length}
        isDataLoading={isDataLoading}
        totalKpiCount={kpis.totalCount}
        currentUserId={user?.id}
        sortBy={sortBy}
        onSortChange={setSortBy}
        eligibleDonationsCount={eligibleDonations.length}
        bulkDonationsTotal={bulkDonationsTotal}
        onBulkApproveDonations={startBulkApproveDonations}
        delayedCommits={delayedCommits}
        onCancelDelayedCommit={cancelDelayedCommit}
        onViewDetails={(txId) => {
          setSelectedTxId(txId);
          setIsDetailOpen(true);
        }}
        onRejectTransaction={(tx) => setTxToReject(tx)}
        onApproveTransaction={startDelayedCommit}
        onVerifyCollection={(collection) => setSelectedCollection(collection)}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Dialogs */}
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

      <RejectTransactionDialog
        isOpen={Boolean(txToReject)}
        onClose={() => setTxToReject(null)}
        mosqueId={mosqueId}
        transaction={txToReject}
      />

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
