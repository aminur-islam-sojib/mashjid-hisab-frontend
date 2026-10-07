import { AccountType } from "@/types/api";

export interface AccountItem {
  id: string;
  mosqueId: string;
  name: string;
  type: AccountType;
  accountNumber?: string | null;
  openingBalance: string;
  currentBalance?: string;
  isArchived: boolean;
  createdAt?: string;
}

