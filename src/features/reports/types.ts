export type ReportTab = "income-expense" | "balances" | "donors" | "periods";
export type IncomeExpenseGroupBy = "month" | "fund" | "category";
export type DonorGroupBy = "member" | "family";
export type DonorStatus = "top" | "all";

export interface IncomeExpenseItem {
  label?: string;
  name?: string;
  group?: string;
  income?: string;
  expense?: string;
}

export interface IncomeExpenseReport {
  totalIncome?: string;
  totalExpenses?: string;
  netSavings?: string;
  netSurplus?: string;
  breakdown?: IncomeExpenseItem[];
  items?: IncomeExpenseItem[];
}

export interface AccountBalance {
  id: string;
  name: string;
  type: string;
  currentBalance?: string;
}

export interface FundBalance {
  id: string;
  name: string;
  isRestricted: boolean;
  currentBalance?: string;
}

export interface BalancesReport {
  totalAccountBalance?: string;
  accounts?: AccountBalance[];
  totalFundBalance?: string;
  funds?: FundBalance[];
}

export interface DonorRankingItem {
  id?: string;
  name?: string;
  donorName?: string;
  totalAmount?: string;
  count?: number;
  donationCount?: number;
}

export interface DonorsReport {
  donors?: DonorRankingItem[];
  data?: DonorRankingItem[];
}

