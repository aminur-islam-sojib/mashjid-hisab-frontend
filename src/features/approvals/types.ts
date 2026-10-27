import {
  UnifiedTransactionItem,
} from "@/features/transactions/types";
import { CollectionSession } from "@/features/collections/types";

export type ApprovalTypeFilter = "ALL" | "DONATION" | "EXPENSE" | "COLLECTION";
export type ApprovalStatusFilter = "ALL" | "PENDING" | "IN_DELAY";
export type ApprovalSortOption = "LATEST" | "OLDEST" | "AMOUNT_DESC" | "AMOUNT_ASC";

export interface DelayedCommitItem {
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
  amount: string; // poisha integer string
  fundName: string;
  accountName: string;
  categoryName?: string;
  createdByName: string;
  createdById?: string | null;
  date: string;
  rawTransaction?: UnifiedTransactionItem;
  rawCollection?: CollectionSession;
}

export interface ApprovalKpis {
  totalCount: number;
  totalVolume: bigint;
  donationCount: number;
  donationVolume: bigint;
  expenseCount: number;
  expenseVolume: bigint;
  collectionCount: number;
}

