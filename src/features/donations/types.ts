import { DonationSource, DonationStatus } from "@/types/api";

export interface DonationItem {
  id: string;
  mosqueId: string;
  amount: string;
  receiptNumber?: string | null;
  status: DonationStatus;
  source: DonationSource;
  date: string;
  donorName?: string | null;
  donorPhone?: string | null;
  donorEmail?: string | null;
  isAnonymousPublic: boolean;
  notes?: string | null;
  accountId: string;
  account?: { id: string; name: string } | null;
  fundId: string;
  fund?: { id: string; name: string } | null;
  categoryId: string;
  category?: { id: string; name: string } | null;
  createdById?: string | null;
  createdBy?: { id: string; name: string; email: string | null } | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  createdAt: string;
}

export interface DonationReceiptData {
  mosque: {
    name: string;
    address?: string | null;
  };
  receiptNumber: string;
  verificationCode: string;
  date: string;
  amount: string;
  donor: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  fund: {
    name: string;
    type: string;
  };
  category: {
    name: string;
  };
  source: DonationSource;
  notes?: string | null;
}

