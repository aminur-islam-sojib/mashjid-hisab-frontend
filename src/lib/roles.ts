// ---------------------------------------------------------------------------
// roles.ts — Centralized Mosque Tenancy & Authorization Role Groups
//
// Source of truth: backend mosque.middleware.ts & docs/SIMPLIFY.md
// ---------------------------------------------------------------------------

import type { Role } from "@/types/api";

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

/**
 * All active membership roles.
 */
export const ALL_ROLES: readonly Role[] = [
  "MOSQUE_ADMIN",
  "TREASURER",
  "COMMITTEE_MEMBER",
  "STAFF",
  "MEMBER",
] as const;

/**
 * Returns the designated default home URL for a given role within a mosque.
 * MEMBER -> /mosques/${mosqueId}/me (My Giving)
 * All other roles -> /mosques/${mosqueId}/dashboard
 */
export function getRoleHome(mosqueId: string, role: Role | null): string {
  if (role === "MEMBER") {
    return `/mosques/${mosqueId}/me`;
  }
  return `/mosques/${mosqueId}/dashboard`;
}

/**
 * Route permissions map mapping route segment names (under /mosques/:mosqueId/)
 * to the allowed roles according to docs/SIMPLIFY.md.
 */
export const ROUTE_PERMISSIONS: Record<string, readonly Role[]> = {
  // Home dashboards & Queues
  dashboard: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER", "STAFF"],
  approvals: FINANCIAL_OPERATOR_ROLES, // ADMIN, TREASURER
  me: ALL_ROLES,

  // Daily operations
  donations: COLLECTION_OPERATOR_ROLES, // ADMIN, TREASURER, STAFF
  expenses: EXPENSE_OPERATOR_ROLES,     // ADMIN, TREASURER, STAFF
  transfers: FINANCIAL_OPERATOR_ROLES,  // ADMIN, TREASURER
  collections: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER", "STAFF"],

  // People & Giving
  members: OVERSIGHT_ROLES,             // ADMIN, TREASURER, COMMITTEE_MEMBER
  families: OVERSIGHT_ROLES,            // ADMIN, TREASURER, COMMITTEE_MEMBER
  chanda: FINANCIAL_OPERATOR_ROLES,     // ADMIN, TREASURER
  pledges: ["MOSQUE_ADMIN", "TREASURER", "MEMBER"],
  campaigns: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER", "MEMBER"],

  // Records
  transactions: OVERSIGHT_ROLES,        // ADMIN, TREASURER, COMMITTEE_MEMBER
  reports: OVERSIGHT_ROLES,             // ADMIN, TREASURER, COMMITTEE_MEMBER

  // Setup & Governance
  accounts: FINANCIAL_OPERATOR_ROLES,   // ADMIN, TREASURER
  funds: FINANCIAL_OPERATOR_ROLES,      // ADMIN, TREASURER
  categories: FINANCIAL_OPERATOR_ROLES, // ADMIN, TREASURER
  "audit-logs": ADMIN_ONLY_ROLES,       // ADMIN
  settings: ADMIN_ONLY_ROLES,           // ADMIN
};

/**
 * Determines whether a given role is allowed to access a route segment.
 */
export function isRouteAllowed(
  segment: string,
  role: Role | null,
  isSuperAdmin: boolean = false
): boolean {
  if (isSuperAdmin) return true;
  if (!role) return false;

  const allowedRoles = ROUTE_PERMISSIONS[segment];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(role);
}
