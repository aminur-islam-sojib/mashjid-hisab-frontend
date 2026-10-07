import { Role } from "@/types/api";

export type TransactionType = "DONATION" | "EXPENSE" | "TRANSFER" | "INCOME";

export type TransactionStatus =
  | "PENDING"
  | "PENDING_APPROVAL"
  | "POSTED"
  | "REJECTED"
  | "VOIDED";

export interface TransactionHistoryStep {
  step: "RECORDED" | "SUBMITTED" | "APPROVED" | "POSTED" | "REJECTED" | "VOIDED";
  label: string;
  performedBy?: { id: string; name: string; email: string | null } | null;
  performedAt: string;
  details?: Record<string, unknown>;
}

export interface UnifiedTransactionItem {
  id: string;
  type: TransactionType;
  transactionNumber: string | null;
  amount: string; // poisha integer string
  date: string;
  status: TransactionStatus;
  party: string | null;
  accountId: string;
  accountName?: string;
  toAccountId?: string | null;
  toAccountName?: string | null;
  fundId: string;
  fundName?: string;
  toFundId?: string | null;
  toFundName?: string | null;
  categoryId: string | null;
  categoryName?: string | null;
  notes: string | null;
  attachments?: string[];
  requiresAdminApproval?: boolean;
  rejectionReason?: string | null;
  voidReason?: string | null;
  createdById: string | null;
  createdBy?: { id: string; name: string; email: string | null } | null;
  createdAt: string;
  updatedAt: string;
  history?: TransactionHistoryStep[];
}

export interface CursorPaginatedTransactions {
  items: UnifiedTransactionItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface PendingQueueResult {
  items: UnifiedTransactionItem[];
  totalPending: number;
}

