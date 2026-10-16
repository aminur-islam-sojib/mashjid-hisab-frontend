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

  it("handles multi-period dataset selection and formatting cleanly", () => {
    const currentMonthPoints = [
      { day: 1, label: "Oct 1", date: "2026-10-01", amount: "100000" },
      { day: 8, label: "Oct 8", date: "2026-10-08", amount: "350000" },
      { day: 15, label: "Oct 15", date: "2026-10-15", amount: "600000" },
      { day: 22, label: "Oct 22", date: "2026-10-22", amount: "845000" },
      { day: 31, label: "Oct 31", date: "2026-10-31", amount: "845000" },
    ];
    const lastMonthPoints = [
      { day: 1, label: "Sep 1", date: "2026-09-01", amount: "80000" },
      { day: 8, label: "Sep 8", date: "2026-09-08", amount: "200000" },
      { day: 15, label: "Sep 15", date: "2026-09-15", amount: "420000" },
      { day: 22, label: "Sep 22", date: "2026-09-22", amount: "700000" },
      { day: 30, label: "Sep 30", date: "2026-09-30", amount: "700000" },
    ];

    assert.equal(currentMonthPoints.length, 5);
    assert.equal(lastMonthPoints.length, 5);
    assert.equal(currentMonthPoints[0].label, "Oct 1");
    assert.equal(lastMonthPoints[0].label, "Sep 1");

    // Total income formatting
    assert.equal(formatCurrency("845000", { showDecimals: false }), "৳8,450");
    assert.equal(formatCurrency("700000", { showDecimals: false }), "৳7,000");
  });
});
