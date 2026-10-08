export type ChandaFrequency = "MONTHLY" | "YEARLY";
export type ChandaPlanStatus = "ACTIVE" | "PAUSED" | "ENDED";
export type DueStatus = "UNPAID" | "PARTIAL" | "PAID" | "WAIVED";

export interface ChandaPlan {
  id: string;
  mosqueId: string;
  amount: string; // poisha
  frequency: ChandaFrequency;
  startMonth: string; // YYYY-MM
  status: ChandaPlanStatus;
  fundId: string;
  fund?: { id: string; name: string };
  memberId?: string | null;
  member?: {
    id: string;
    user?: { name: string; email?: string | null; phone?: string | null };
  } | null;
  familyId?: string | null;
  family?: { id: string; name: string } | null;
  createdAt: string;
}

export interface DueRecord {
  id: string;
  mosqueId: string;
  period: string; // YYYY-MM
  amount: string; // poisha
  paidAmount: string; // poisha
  status: DueStatus;
  fundId: string;
  fund?: { id: string; name: string };
  planId?: string | null;
  memberId?: string | null;
  member?: {
    id: string;
    user?: { name: string; email?: string | null; phone?: string | null };
  } | null;
  familyId?: string | null;
  family?: { id: string; name: string } | null;
  waivedAt?: string | null;
  waivedReason?: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DuesSummary {
  period: string;
  totalExpected: string; // poisha
  totalCollected: string; // poisha
  totalWaived: string; // poisha
  totalOutstanding: string; // poisha
  collectionRate: number | string;
  totalDuesCount: number;
  defaulterCount?: number;
  paidCount?: number;
  partialCount?: number;
  unpaidCount?: number;
  waivedCount?: number;
  defaulters: Array<{
    dueId: string;
    period: string;
    status: DueStatus;
    payerType: "FAMILY" | "MEMBER";
    payerName: string;
    fund: { id: string; name: string };
    amount: string;
    paidAmount: string;
    remainingAmount: string;
    member?: {
      id: string;
      user?: { name: string; phone?: string | null; email?: string | null };
    } | null;
    family?: { id: string; name: string } | null;
  }>;
}

