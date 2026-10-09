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

export interface DonationReceiptAmount {
  raw: string;
  formatted: string;
  currency: string;
}

export interface DonationReceiptData {
  receiptNumber: string;
  verificationCode: string;
  date: string;
  issuedAt?: string;
  status?: DonationStatus;
  isVoided?: boolean;
  voidInfo?: {
    voidedAt: string;
    reason: string | null;
    voidedBy: { id: string; name: string; email: string | null } | null;
    reversalReceiptNumber?: string | null;
  } | null;
  mosque: {
    id?: string;
    name: string;
    slug?: string;
    address?: string | null;
    timezone?: string;
  };
  donor: {
    type?: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    memberId?: string | null;
    familyId?: string | null;
    isAnonymousPublic?: boolean;
  };
  amount: string | DonationReceiptAmount;
  fund: {
    id?: string;
    name: string;
    type?: string;
    isRestricted?: boolean;
  };
  category: {
    id?: string;
    name: string;
  };
  account?: {
    id?: string;
    name: string;
    accountNumber?: string | null;
  } | null;
  source: DonationSource;
  notes?: string | null;
  reversalOfReceiptNumber?: string | null;
}


