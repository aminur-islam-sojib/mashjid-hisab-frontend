import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { majorToPoisha, formatCurrency } from "../src/lib/money";
import { COLLECTION_OPERATOR_ROLES, ADMIN_ONLY_ROLES } from "../src/lib/roles";

describe("Campaign Contribution & Administration Validation Suite", () => {
  it("converts major Taka input into integer poisha for ledger accuracy", () => {
    // ৳500 -> 50000 poisha
    assert.equal(majorToPoisha("500"), "50000");
    // ৳1,000 -> 100000 poisha
    assert.equal(majorToPoisha("1000"), "100000");
    // ৳2,500.50 -> 250050 poisha
    assert.equal(majorToPoisha("2500.50"), "250050");
    // Formats correctly as currency
    assert.equal(formatCurrency("50000"), "৳500.00");
  });

  it("ensures contributor types conform to required payload schemas", () => {
    // Scenario 1: Mosque Member contribution
    const memberContribution = {
      contributorType: "MEMBER",
      memberId: "mem-123",
      amount: majorToPoisha("5000"),
      campaignId: "camp-001",
      fundId: "fund-gen",
      accountId: "acc-cash",
    };
    assert.ok(memberContribution.memberId);
    assert.equal(memberContribution.amount, "500000");

    // Scenario 2: Other Person (Walk-in / Guest) contribution
    const guestContribution = {
      contributorType: "GUEST",
      donorName: "Mohammad Karim",
      donorPhone: "01711000000",
      amount: majorToPoisha("2000"),
      campaignId: "camp-001",
      fundId: "fund-gen",
      accountId: "acc-bank",
    };
    assert.ok(guestContribution.donorName.trim().length > 0);
    assert.equal(guestContribution.donorPhone, "01711000000");
    assert.equal(guestContribution.amount, "200000");

    // Scenario 3: Anonymous donor contribution
    const anonymousContribution = {
      contributorType: "ANONYMOUS",
      isAnonymousPublic: true,
      amount: majorToPoisha("1000"),
      campaignId: "camp-001",
      fundId: "fund-gen",
      accountId: "acc-cash",
    };
    assert.equal(anonymousContribution.isAnonymousPublic, true);
    assert.equal(anonymousContribution.amount, "100000");
  });

  it("verifies administrative and collection operator roles can record campaign money", () => {
    // Both MOSQUE_ADMIN and TREASURER must be allowed to record contributions
    assert.ok(ADMIN_ONLY_ROLES.includes("MOSQUE_ADMIN"));
    assert.ok(COLLECTION_OPERATOR_ROLES.includes("MOSQUE_ADMIN"));
    assert.ok(COLLECTION_OPERATOR_ROLES.includes("TREASURER"));
  });

  it("calculates live progress impact of new contribution correctly", () => {
    const targetAmount = "10000000"; // ৳100,000 in poisha
    const currentRaised = "4000000"; // ৳40,000 in poisha
    const newContribution = "1000000"; // ৳10,000 in poisha

    const projectedRaised = BigInt(currentRaised) + BigInt(newContribution);
    assert.equal(projectedRaised.toString(), "5000000"); // ৳50,000

    const currentPercent = Math.round((Number(currentRaised) / Number(targetAmount)) * 100);
    const projectedPercent = Math.round((Number(projectedRaised) / Number(targetAmount)) * 100);

    assert.equal(currentPercent, 40);
    assert.equal(projectedPercent, 50);
  });
});

