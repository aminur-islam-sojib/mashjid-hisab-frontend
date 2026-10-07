export type PledgeStatus = "OPEN" | "PARTIAL" | "FULFILLED" | "CANCELLED";

export interface PledgeRecord {
  id: string;
  mosqueId: string;
  amount: string; // poisha
  paidAmount: string; // poisha
  remainingAmount?: string; // poisha
  dueDate: string;
  installments: number;
  status: PledgeStatus;
  fundId?: string | null;
  fund?: { id: string; name: string } | null;
  campaignId?: string | null;
  campaign?: { id: string; title: string } | null;
  memberId?: string | null;
  member?: {
    id: string;
    user?: { name: string; phone?: string | null; email?: string | null };
  } | null;
  familyId?: string | null;
  family?: { id: string; name: string } | null;
  donorName?: string | null;
  donorPhone?: string | null;
  donorEmail?: string | null;
  notes?: string | null;
  cancelReason?: string | null;
  createdAt: string;
}

