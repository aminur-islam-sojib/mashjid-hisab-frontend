import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { updateRoleSchema } from "../src/features/members/validation";

describe("Member Status & Role Validation Suite", () => {
  it("accepts valid MembershipStatus values including SUSPENDED and ACTIVE", () => {
    const validActive = updateRoleSchema.safeParse({
      role: "MEMBER",
      status: "ACTIVE",
    });
    assert.equal(validActive.success, true);

    const validSuspended = updateRoleSchema.safeParse({
      role: "MEMBER",
      status: "SUSPENDED",
    });
    assert.equal(validSuspended.success, true);

    const validPending = updateRoleSchema.safeParse({
      role: "STAFF",
      status: "PENDING",
    });
    assert.equal(validPending.success, true);
  });

  it("rejects invalid status", () => {
    const invalidStatus = updateRoleSchema.safeParse({
      role: "MEMBER",
      status: "SOME_RANDOM_STATUS",
    });
    assert.equal(invalidStatus.success, false);
  });
});

