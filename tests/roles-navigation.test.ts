import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Role } from "../src/types/api";
import {
  getRoleHome,
  isRouteAllowed,
  ROUTE_PERMISSIONS,
  ALL_ROLES,
} from "../src/lib/roles";

describe("T04: Role-Aware Navigation & Route Guards Invariant Suite", () => {
  const mosqueId = "test-mosque-123";

  it("1. getRoleHome returns /me for MEMBER and /dashboard for all other roles", () => {
    assert.equal(getRoleHome(mosqueId, "MEMBER"), `/mosques/${mosqueId}/me`);
    assert.equal(getRoleHome(mosqueId, "STAFF"), `/mosques/${mosqueId}/dashboard`);
    assert.equal(getRoleHome(mosqueId, "COMMITTEE_MEMBER"), `/mosques/${mosqueId}/dashboard`);
    assert.equal(getRoleHome(mosqueId, "TREASURER"), `/mosques/${mosqueId}/dashboard`);
    assert.equal(getRoleHome(mosqueId, "MOSQUE_ADMIN"), `/mosques/${mosqueId}/dashboard`);
  });

  it("2. MEMBER is restricted to My Giving (/me), Pledges (/pledges), and Campaigns (/campaigns)", () => {
    // Allowed
    assert.equal(isRouteAllowed("me", "MEMBER"), true);
    assert.equal(isRouteAllowed("pledges", "MEMBER"), true);
    assert.equal(isRouteAllowed("campaigns", "MEMBER"), true);

    // Forbidden
    const forbiddenForMember = [
      "dashboard",
      "approvals",
      "accounts",
      "donations",
      "expenses",
      "transfers",
      "transactions",
      "reports",
      "members",
      "families",
      "chanda",
      "collections",
      "funds",
      "categories",
      "settings",
      "audit-logs",
    ];

    for (const route of forbiddenForMember) {
      assert.equal(
        isRouteAllowed(route, "MEMBER"),
        false,
        `Route '${route}' must be forbidden for MEMBER`
      );
    }
  });

  it("3. STAFF is restricted to Dashboard, Donations, Expenses, Box Collections, and My Giving", () => {
    const allowedForStaff = ["dashboard", "donations", "expenses", "collections", "me"];
    for (const route of allowedForStaff) {
      assert.equal(
        isRouteAllowed(route, "STAFF"),
        true,
        `Route '${route}' must be allowed for STAFF`
      );
    }

    const forbiddenForStaff = [
      "approvals",
      "accounts",
      "funds",
      "transfers",
      "transactions",
      "reports",
      "members",
      "families",
      "chanda",
      "pledges",
      "campaigns",
      "categories",
      "settings",
      "audit-logs",
    ];

    for (const route of forbiddenForStaff) {
      assert.equal(
        isRouteAllowed(route, "STAFF"),
        false,
        `Route '${route}' must be forbidden for STAFF`
      );
    }
  });

  it("4. COMMITTEE_MEMBER is restricted to read-only oversight routes and cannot access financial modification/setup", () => {
    const allowedForCommittee = [
      "dashboard",
      "transactions",
      "collections",
      "campaigns",
      "members",
      "families",
      "reports",
      "me",
    ];

    for (const route of allowedForCommittee) {
      assert.equal(
        isRouteAllowed(route, "COMMITTEE_MEMBER"),
        true,
        `Route '${route}' must be allowed for COMMITTEE_MEMBER`
      );
    }

    const forbiddenForCommittee = [
      "approvals",
      "accounts",
      "funds",
      "transfers",
      "categories",
      "chanda",
      "donations",
      "expenses",
      "settings",
      "audit-logs",
    ];

    for (const route of forbiddenForCommittee) {
      assert.equal(
        isRouteAllowed(route, "COMMITTEE_MEMBER"),
        false,
        `Route '${route}' must be forbidden for COMMITTEE_MEMBER`
      );
    }
  });

  it("5. TREASURER has full financial management but cannot access Admin-only settings or audit-logs", () => {
    assert.equal(isRouteAllowed("audit-logs", "TREASURER"), false);
    assert.equal(isRouteAllowed("settings", "TREASURER"), false);

    assert.equal(isRouteAllowed("dashboard", "TREASURER"), true);
    assert.equal(isRouteAllowed("approvals", "TREASURER"), true);
    assert.equal(isRouteAllowed("accounts", "TREASURER"), true);
    assert.equal(isRouteAllowed("funds", "TREASURER"), true);
    assert.equal(isRouteAllowed("donations", "TREASURER"), true);
    assert.equal(isRouteAllowed("expenses", "TREASURER"), true);
    assert.equal(isRouteAllowed("transfers", "TREASURER"), true);
    assert.equal(isRouteAllowed("chanda", "TREASURER"), true);
    assert.equal(isRouteAllowed("transactions", "TREASURER"), true);
    assert.equal(isRouteAllowed("reports", "TREASURER"), true);
  });

  it("6. MOSQUE_ADMIN has access to all routes including audit-logs and settings", () => {
    for (const route of Object.keys(ROUTE_PERMISSIONS)) {
      assert.equal(
        isRouteAllowed(route, "MOSQUE_ADMIN"),
        true,
        `Route '${route}' must be allowed for MOSQUE_ADMIN`
      );
    }
  });

  it("7. Super admin override allows access regardless of role", () => {
    assert.equal(isRouteAllowed("accounts", "MEMBER", true), true);
    assert.equal(isRouteAllowed("audit-logs", "STAFF", true), true);
  });

  it("8. Sidebar nav items match SIMPLIFY.md target counts for all 5 roles", () => {
    const allRoutes = Object.keys(ROUTE_PERMISSIONS);
    assert.equal(allRoutes.length, 19);

    const getVisibleCount = (role: Role) => {
      return allRoutes.filter((r) => isRouteAllowed(r, role)).length;
    };

    assert.equal(getVisibleCount("MOSQUE_ADMIN"), 19, "Admin sees 19 items");
    assert.equal(getVisibleCount("TREASURER"), 17, "Treasurer sees 17 items");
    assert.equal(getVisibleCount("COMMITTEE_MEMBER"), 8, "Committee sees 8 items");
    assert.equal(getVisibleCount("STAFF"), 5, "Staff sees 5 items");
    assert.equal(getVisibleCount("MEMBER"), 3, "Member sees 3 items");
  });

  it("9. Consolidated routes (people, money) resolve permissions correctly for authorized roles", () => {
    // MOSQUE_ADMIN can access people and money
    assert.equal(isRouteAllowed("people", "MOSQUE_ADMIN"), true);
    assert.equal(isRouteAllowed("money", "MOSQUE_ADMIN"), true);

    // TREASURER can access people and money
    assert.equal(isRouteAllowed("people", "TREASURER"), true);
    assert.equal(isRouteAllowed("money", "TREASURER"), true);

    // COMMITTEE_MEMBER can access people and money
    assert.equal(isRouteAllowed("people", "COMMITTEE_MEMBER"), true);
    assert.equal(isRouteAllowed("money", "COMMITTEE_MEMBER"), true);

    // STAFF cannot access people or money
    assert.equal(isRouteAllowed("people", "STAFF"), false);
    assert.equal(isRouteAllowed("money", "STAFF"), false);

    // MEMBER cannot access people or money directly
    assert.equal(isRouteAllowed("people", "MEMBER"), false);
    assert.equal(isRouteAllowed("money", "MEMBER"), false);
  });
});
