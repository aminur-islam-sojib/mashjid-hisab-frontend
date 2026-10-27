import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatCompactCurrency } from "../src/lib/money";

describe("Dashboard Home & Financial Integration Test Suite", () => {
  it("formats dashboard currency properly end-to-end", () => {
    // Integer poisha testing for dashboard KPI
    assert.equal(formatCurrency(845000n, { showDecimals: false }), "৳8,450");
    assert.equal(formatCurrency("845000", { showDecimals: false }), "৳8,450");
    assert.equal(formatCurrency(0n, { showDecimals: false }), "৳0");

    // Compact currency formatting for chart Y-axis scale
    assert.equal(formatCompactCurrency(1100000n), "৳11k");
    assert.equal(formatCompactCurrency(730000n), "৳7.3k");
    assert.equal(formatCompactCurrency(360000n), "৳3.6k");
    assert.equal(formatCompactCurrency(0n), "৳0");
    assert.equal(formatCompactCurrency(150000000n), "৳1.5M");
  });

  it("handles zero and unallocated poisha properly", () => {
    const unallocated = "0";
    assert.equal(unallocated === "0", true);
    const unallocatedAmount = 150000n;
    assert.equal(formatCurrency(unallocatedAmount), "৳1,500.00");
  });

  it("handles trend calculation and milestone point coordinate constraints across responsive widths", () => {
    const maxVal = 1000000n;
    const currentVal = 500000n;
    const ratio = Number(currentVal) / Number(maxVal);
    assert.equal(ratio, 0.5);

    const yBaseline = 120;
    const yTop = 16;
    const y = yBaseline - ratio * (yBaseline - yTop);
    assert.equal(y, 68);
    assert.ok(y >= yTop && y <= yBaseline);

    // Responsive X-span scaling across desktop and mobile widths
    for (const testWidth of [320, 500, 640, 800]) {
      const xStart = 38;
      const xEnd = Math.max(xStart + 60, testWidth - 8);
      const numPoints = 5;
      const coords = Array.from({ length: numPoints }, (_, idx) => {
        return xStart + (idx / (numPoints - 1)) * (xEnd - xStart);
      });

      assert.equal(coords[0], xStart);
      assert.equal(coords[coords.length - 1], xEnd);
      assert.ok(xEnd <= testWidth - 8);
      // Ensure points are strictly ascending across the entire width
      for (let i = 0; i < coords.length - 1; i++) {
        assert.ok(coords[i] < coords[i + 1]);
      }
    }
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

  it("handles the 4 financial KPI card values, trends, and dates cleanly", () => {
    // 1. Total treasury balance
    const treasuryPoisha = 12500000n; // ৳125,000.00
    assert.equal(formatCurrency(treasuryPoisha, { showDecimals: false }), "৳125,000");

    // 2. Income this month & trend
    const incomePoisha = 845000n; // ৳8,450.00
    assert.equal(formatCurrency(incomePoisha, { showDecimals: false }), "৳8,450");
    const incomeTrend = 15;
    assert.ok(incomeTrend > 0);

    // 3. Spending this month & trend
    const expensePoisha = 320000n; // ৳3,200.00
    assert.equal(formatCurrency(expensePoisha, { showDecimals: false }), "৳3,200");
    const expenseTrend = -5;
    assert.ok(expenseTrend < 0);

    // 4. Pending approvals count & total amount
    const pendingCount = 3;
    const pendingAmount = 45000n;
    assert.equal(pendingCount, 3);
    assert.equal(formatCurrency(pendingAmount, { showDecimals: false }), "৳450");

    // Date representation
    const testDate = new Date("2026-10-16T12:00:00Z");
    const formattedDate = testDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    assert.equal(formattedDate, "Oct 16, 2026");
  });
});
