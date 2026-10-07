import { TransferStatus } from "@/types/api";

export interface TransferItem {
  id: string;
  mosqueId: string;
  amount: string;
  date: string;
  status: TransferStatus;
  notes?: string | null;
  reason?: string | null;
  fromAccountId: string;
  fromAccount?: { id: string; name: string } | null;
  toAccountId: string;
  toAccount?: { id: string; name: string } | null;
  fromFundId: string;
  fromFund?: { id: string; name: string } | null;
  toFundId?: string | null;
  toFund?: { id: string; name: string } | null;
  isFundTransfer: boolean;
  createdById?: string | null;
  createdBy?: { id: string; name: string; email: string | null } | null;
  createdAt: string;
}

