export type CollectionStatus = "OPEN" | "VERIFIED";

export interface CollectionSession {
  id: string;
  mosqueId: string;
  occasion: string;
  date: string;
  totalAmount: string; // poisha integer string
  notes: string | null;
  status: CollectionStatus;
  fundId: string | null;
  fund?: {
    id: string;
    name: string;
    type?: string;
    isRestricted?: boolean;
  } | null;
  accountId: string | null;
  account?: {
    id: string;
    name: string;
    type?: string;
  } | null;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    type?: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  verifiedBy?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  donation?: {
    id: string;
    amount: string;
    receiptNumber: string | null;
    status: string;
    date: string;
  } | null;
}

export interface CollectionSessionsResponse {
  data: CollectionSession[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


