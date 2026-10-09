export type ReportTab = "income-expense" | "balances" | "donors" | "periods";
export type IncomeExpenseGroupBy = "month" | "fund" | "category";
export type DonorGroupBy = "member" | "family";
export type DonorStatus = "top" | "all";

export interface IncomeExpenseCategoryItem {
  categoryId?: string;
  categoryName?: string;
  name?: string;
  label?: string;
  type?: "INCOME" | "EXPENSE" | string;
  amount?: string;
  formattedAmount?: string;
  income?: string;
  expense?: string;
  count?: number;
}

export interface IncomeExpenseFundItem {
  fundId?: string;
  fundName?: string;
  name?: string;
  label?: string;
  fundType?: string;
  income?: string;
  formattedIncome?: string;
  expense?: string;
  formattedExpense?: string;
  net?: string;
  formattedNet?: string;
}

export interface IncomeExpenseMonthItem {
  month?: string;
  name?: string;
  label?: string;
  income?: string;
  formattedIncome?: string;
  expense?: string;
  formattedExpense?: string;
  net?: string;
  formattedNet?: string;
}

export interface IncomeExpenseItem {
  label?: string;
  name?: string;
  group?: string;
  type?: string;
  income?: string;
  expense?: string;
  amount?: string;
  count?: number;
  net?: string;
  fundName?: string;
  month?: string;
}

export interface IncomeExpenseReport {
  totalIncome?: string;
  formattedTotalIncome?: string;
  totalExpense?: string;
  totalExpenses?: string;
  formattedTotalExpense?: string;
  formattedTotalExpenses?: string;
  netSavings?: string;
  netSurplus?: string;
  formattedNetSavings?: string;
  formattedNetSurplus?: string;
  groupBy?: string;
  incomeCategories?: IncomeExpenseCategoryItem[];
  expenseCategories?: IncomeExpenseCategoryItem[];
  data?: any[];
  breakdown?: IncomeExpenseItem[];
  items?: IncomeExpenseItem[];
}

export interface AccountBalance {
  id: string;
  name: string;
  type: string;
  balance?: string;
  currentBalance?: string;
  formattedBalance?: string;
  formattedCurrentBalance?: string;
}

export interface FundBalance {
  id: string;
  name: string;
  isRestricted: boolean;
  balance?: string;
  currentBalance?: string;
  formattedBalance?: string;
  formattedCurrentBalance?: string;
}

export interface BalancesReport {
  asOf?: string | Date;
  totalAccountsBalance?: string;
  totalAccountBalance?: string;
  formattedTotalAccountsBalance?: string;
  formattedTotalAccountBalance?: string;
  accounts?: AccountBalance[];
  totalFundsBalance?: string;
  totalFundBalance?: string;
  formattedTotalFundsBalance?: string;
  formattedTotalFundBalance?: string;
  funds?: FundBalance[];
}

export interface DonorRankingItem {
  id?: string;
  donorId?: string;
  name?: string;
  donorName?: string;
  phone?: string | null;
  email?: string | null;
  totalGiven?: string;
  totalAmount?: string;
  formattedTotalGiven?: string;
  count?: number;
  donationCount?: number;
}

export interface DonorsReport {
  groupBy?: string;
  totalDonorsCount?: number;
  totalDonationsCount?: number;
  totalGiving?: string;
  formattedTotalGiving?: string;
  topDonors?: DonorRankingItem[];
  donors?: DonorRankingItem[];
  data?: DonorRankingItem[];
}

