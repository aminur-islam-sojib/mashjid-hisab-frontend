import { ExpenseStatus } from "@/types/api";

export interface ExpenseItem {
  id: string;
  mosqueId: string;
  amount: string;
  voucherNo?: string | null;
  status: ExpenseStatus;
  date: string;
  payee: string;
  notes?: string | null;
  attachments?: string[];
  accountId: string;
  account?: { id: string; name: string } | null;
  fundId: string;
  fund?: { id: string; name: string } | null;
  categoryId: string;
  category?: { id: string; name: string } | null;
  createdById?: string | null;
  createdBy?: { id: string; name: string; email: string | null } | null;
  approvedById?: string | null;
  approvedBy?: { id: string; name: string; email: string | null } | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  createdAt: string;
}

