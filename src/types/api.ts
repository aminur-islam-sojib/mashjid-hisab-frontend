// ---------------------------------------------------------------------------
// Mashjid Hisab — Global API Types and Backend Contract Enums
// ---------------------------------------------------------------------------

export type Role =
  | "SUPER_ADMIN"
  | "MOSQUE_ADMIN"
  | "TREASURER"
  | "STAFF"
  | "COMMITTEE_MEMBER"
  | "MEMBER";

export type MembershipStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type FundType =
  | "GENERAL"
  | "ZAKAT"
  | "SADAQAH"
  | "CONSTRUCTION"
  | "MADRASA"
  | "QURBANI"
  | "WAQF"
  | "IFTAR"
  | "OTHER";

export type AccountType = "CASH" | "BANK" | "MOBILE_WALLET" | "CARD" | "OTHER";

export type CategoryType = "INCOME" | "EXPENSE";

export type FamilyRelation =
  | "SPOUSE"
  | "SON"
  | "DAUGHTER"
  | "FATHER"
  | "MOTHER"
  | "SIBLING"
  | "GRANDPARENT"
  | "OTHER";

export type DonationStatus = "PENDING" | "POSTED" | "REJECTED" | "VOIDED";

export type DonationSource = "CASH_BOX" | "MEMBER" | "ONLINE" | "BANK";

export type ExpenseStatus =
  | "PENDING"
  | "PENDING_APPROVAL"
  | "POSTED"
  | "REJECTED"
  | "VOIDED";

export type TransferStatus = "POSTED" | "VOIDED";

export type CampaignStatus = "ACTIVE" | "CLOSED";

export type PledgeStatus = "OPEN" | "PARTIAL" | "FULFILLED" | "CANCELLED";

export type ChandaFrequency = "MONTHLY" | "YEARLY";

export type ChandaPlanStatus = "ACTIVE" | "PAUSED" | "ENDED";

export type DueStatus = "UNPAID" | "PARTIAL" | "PAID" | "WAIVED";

export type CollectionStatus = "OPEN" | "VERIFIED" | "REJECTED";

export type ReportType =
  | "DASHBOARD"
  | "BALANCES"
  | "INCOME_EXPENSE"
  | "FUND_STATEMENT"
  | "ACCOUNT_STATEMENT"
  | "DONORS"
  | "FISCAL_YEAR";

export type ExportFormat = "CSV" | "XLSX" | "PDF";

export type ExportStatus = "PENDING" | "COMPLETED" | "FAILED";

export type AuditAction =
  | "CREATE"
  | "APPROVE"
  | "VOID"
  | "WAIVE"
  | "REJECT"
  | "CLOSE_PERIOD"
  | "REOPEN_PERIOD"
  | "RECONCILE"
  | "TRANSFER";

export type AuditEntity =
  | "DONATION"
  | "EXPENSE"
  | "TRANSFER"
  | "DUE"
  | "PERIOD"
  | "COLLECTION"
  | "ACCOUNT";

// ---------------------------------------------------------------------------
// Standard API Envelope Interfaces
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  field: string;
  issue: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  _dev?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: ValidationIssue[] | null;
  };
}

export interface OffsetPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: OffsetPagination;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

