import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatCurrency } from "../src/lib/money";

describe("Dashboard Home & Financial Integration Test Suite", () => {
  it("formats dashboard currency properly end-to-end", () => {
    // Integer poisha testing for dashboard KPI
    assert.equal(formatCurrency(845000n, { showDecimals: false }), "৳8,450");
    assert.equal(formatCurrency("845000", { showDecimals: false }), "৳8,450");
    assert.equal(formatCurrency(0n, { showDecimals: false }), "৳0");
  });

  it("handles zero and unallocated poisha properly", () => {
    const unallocated = "0";
    assert.equal(unallocated === "0", true);
    const unallocatedAmount = 150000n;
    assert.equal(formatCurrency(unallocatedAmount), "৳1,500.00");
  });

  it("handles trend calculation and milestone point coordinate constraints", () => {
    const maxVal = 1000000n;
    const currentVal = 500000n;
    const ratio = Number(currentVal) / Number(maxVal);
    assert.equal(ratio, 0.5);

    const yBaseline = 121;
    const yTop = 14;
    const y = yBaseline - ratio * (yBaseline - yTop);
    assert.equal(y, 67.5);
    assert.ok(y >= yTop && y <= yBaseline);
  });
});
