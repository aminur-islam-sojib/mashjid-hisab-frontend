// ---------------------------------------------------------------------------
// roles.ts — Centralized Mosque Tenancy & Authorization Role Groups
//
// Source of truth: backend mosque.middleware.ts
// ---------------------------------------------------------------------------

import { Role } from "@/types/api";

/**
 * Roles permitted to view chart of accounts, funds, bank account numbers, etc.
 * MOSQUE_ADMIN, TREASURER, COMMITTEE_MEMBER
 */
export const OVERSIGHT_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
  "TREASURER",
  "COMMITTEE_MEMBER",
] as const;

/**
 * Roles permitted to modify financial records, chart of accounts, bank transfers,
 * and record transactions across all accounts.
 * MOSQUE_ADMIN, TREASURER
 */
export const FINANCIAL_OPERATOR_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
  "TREASURER",
] as const;

/**
 * Administrator-only governance role.
 * MOSQUE_ADMIN
 */
export const ADMIN_ONLY_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
] as const;

/**
 * Roles permitted to view operational records such as categories for expense entry.
 * MOSQUE_ADMIN, TREASURER, COMMITTEE_MEMBER, STAFF
 */
export const OPERATIONAL_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
  "TREASURER",
  "COMMITTEE_MEMBER",
  "STAFF",
] as const;

/**
 * Roles permitted to record donations and counting sessions.
 * MOSQUE_ADMIN, TREASURER (post immediately); STAFF (saved as PENDING).
 */
export const COLLECTION_OPERATOR_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
  "TREASURER",
  "STAFF",
] as const;

/**
 * Roles permitted to record disbursements and expenses.
 * MOSQUE_ADMIN, TREASURER (post immediately / pending approval); STAFF (saved as PENDING).
 */
export const EXPENSE_OPERATOR_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
  "TREASURER",
  "STAFF",
] as const;

