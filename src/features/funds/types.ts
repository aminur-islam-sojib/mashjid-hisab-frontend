import { FundType } from "@/types/api";

export interface FundItem {
  id: string;
  mosqueId: string;
  name: string;
  type: FundType;
  isRestricted: boolean;
  description: string | null;
  isArchived: boolean;
  currentBalance?: string;
  createdAt?: string;
}

