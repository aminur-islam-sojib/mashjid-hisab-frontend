"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/money";
import { IncomeExpenseReport } from "../types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, BarChart2, TableProperties } from "lucide-react";

interface SummaryViewProps {
  data?: IncomeExpenseReport;
  isLoading: boolean;
  startDate: string;
  endDate: string;
  isOfficialMode?: boolean;
}

export function SummaryView({
  data,
  isLoading,
  startDate,
  endDate,
  isOfficialMode = false,
}: SummaryViewProps) {
  const [showAllIncome, setShowAllIncome] = React.useState(false);
  const [showAllExpense, setShowAllExpense] = React.useState(false);
  const [displayStyle, setDisplayStyle] = React.useState<"statement" | "visual">(
    isOfficialMode ? "statement" : "visual"
  );

  React.useEffect(() => {
    if (isOfficialMode) {
      setDisplayStyle("statement");
    }
  }, [isOfficialMode]);

  const totalIncomePoisha = BigInt(data?.totalIncome || "0");
  const totalExpensePoisha = BigInt(data?.totalExpense || data?.totalExpenses || "0");
  const netSurplusPoisha = BigInt(data?.netSurplus || data?.netSavings || (totalIncomePoisha - totalExpensePoisha).toString());
  const isNetSurplus = netSurplusPoisha >= 0n;

  // Income sources sorted descending
  const incomeCategories = React.useMemo(() => {
    const list = [...(data?.incomeCategories || [])];
    return list.sort((a, b) => {
      const aAmt = BigInt(a.amount || a.income || "0");
      const bAmt = BigInt(b.amount || b.income || "0");
      if (aAmt > bAmt) return -1;
      if (aAmt < bAmt) return 1;
      return 0;
    });
  }, [data?.incomeCategories]);

  // Expense categories sorted descending
  const expenseCategories = React.useMemo(() => {
    const list = [...(data?.expenseCategories || [])];
    return list.sort((a, b) => {
      const aAmt = BigInt(a.amount || a.expense || "0");
      const bAmt = BigInt(b.amount || b.expense || "0");
      if (aAmt > bAmt) return -1;
      if (aAmt < bAmt) return 1;
      return 0;
    });
  }, [data?.expenseCategories]);

  const displayedIncome = showAllIncome
    ? incomeCategories
    : incomeCategories.slice(0, 5);

  const displayedExpenses = showAllExpense
    ? expenseCategories
    : expenseCategories.slice(0, 5);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground text-sm">
        Compiling financial receipts & disbursements...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground text-sm">
        No statement data available for the selected range.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Switcher Controls (Print: Hidden) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5 p-0.5 bg-muted/60 rounded-md w-fit border border-border">
          <button
            type="button"
            onClick={() => setDisplayStyle("visual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              displayStyle === "visual"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Visual Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayStyle("statement")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              displayStyle === "statement"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Institutional Statement</span>
          </button>
        </div>

        <span className="text-xs text-muted-foreground hidden sm:inline">
          {incomeCategories.length} income lines &bull; {expenseCategories.length} expense lines
        </span>
      </div>

      {/* =================================================================== */}
      {/* 1. Official Statement Tables (Always shown on print, or in statement view) */}
      {/* =================================================================== */}
      <div className={displayStyle === "statement" ? "space-y-5" : "hidden print:block print:space-y-5"}>
        {/* Income Sources Table */}
        <div className="bg-card rounded-lg border border-border shadow-xs overflow-hidden print:border-gray-800 print:rounded-none">
          <div className="p-3.5 sm:p-4 bg-muted/30 border-b border-border/80 flex items-center justify-between print:bg-transparent print:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 print:border print:border-gray-800">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground print:text-gray-900">
                Schedule A: Inflow & Revenue Collections (আয় সমূহ)
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums print:text-gray-900">
              {formatCurrency(totalIncomePoisha)}
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category / Collection Head</TableHead>
                <TableHead className="text-center w-28">Receipts</TableHead>
                <TableHead className="text-right w-24">Share</TableHead>
                <TableHead className="text-right w-40">Amount (BDT ৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No income entries recorded for this period.
                  </TableCell>
                </TableRow>
              ) : (
                incomeCategories.map((cat, idx) => {
                  const amountPoisha = BigInt(cat.amount || cat.income || "0");
                  const sharePct =
                    totalIncomePoisha > 0n
                      ? (Number((amountPoisha * 1000n) / totalIncomePoisha) / 10).toFixed(1)
                      : "0.0";

                  return (
                    <TableRow key={cat.categoryId || idx}>
                      <TableCell className="font-semibold text-foreground text-xs">
                        {cat.categoryName || cat.name || "General Donations"}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground font-mono tabular-nums">
                        {cat.count ?? 1}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums">
                        {sharePct}%
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground font-mono tabular-nums text-xs">
                        {formatCurrency(amountPoisha)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {/* Formal Accounting Subtotal */}
              <TableRow className="border-t-2 border-border/90 bg-muted/20 font-bold text-xs print:border-gray-800">
                <TableCell>Total Inflows (Schedule A)</TableCell>
                <TableCell className="text-center font-mono tabular-nums">
                  {incomeCategories.reduce((acc, c) => acc + (c.count ?? 1), 0)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">100%</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400 print:text-gray-900 text-sm">
                  {formatCurrency(totalIncomePoisha)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Expenditures Table */}
        <div className="bg-card rounded-lg border border-border shadow-xs overflow-hidden print:border-gray-800 print:rounded-none">
          <div className="p-3.5 sm:p-4 bg-muted/30 border-b border-border/80 flex items-center justify-between print:bg-transparent print:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-600 print:border print:border-gray-800">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground print:text-gray-900">
                Schedule B: Outflow & Operational Expenditures (ব্যয় সমূহ)
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 font-mono tabular-nums print:text-gray-900">
              {formatCurrency(totalExpensePoisha)}
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category / Purpose</TableHead>
                <TableHead className="text-center w-28">Vouchers</TableHead>
                <TableHead className="text-right w-24">Share</TableHead>
                <TableHead className="text-right w-40">Amount (BDT ৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No expense vouchers recorded for this period.
                  </TableCell>
                </TableRow>
              ) : (
                expenseCategories.map((cat, idx) => {
                  const amountPoisha = BigInt(cat.amount || cat.expense || "0");
                  const sharePct =
                    totalExpensePoisha > 0n
                      ? (Number((amountPoisha * 1000n) / totalExpensePoisha) / 10).toFixed(1)
                      : "0.0";

                  return (
                    <TableRow key={cat.categoryId || idx}>
                      <TableCell className="font-semibold text-foreground text-xs">
                        {cat.categoryName || cat.name || "General Operational"}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground font-mono tabular-nums">
                        {cat.count ?? 1}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums">
                        {sharePct}%
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground font-mono tabular-nums text-xs">
                        {formatCurrency(amountPoisha)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {/* Formal Accounting Subtotal */}
              <TableRow className="border-t-2 border-border/90 bg-muted/20 font-bold text-xs print:border-gray-800">
                <TableCell>Total Outflows (Schedule B)</TableCell>
                <TableCell className="text-center font-mono tabular-nums">
                  {expenseCategories.reduce((acc, c) => acc + (c.count ?? 1), 0)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">100%</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-rose-700 dark:text-rose-400 print:text-gray-900 text-sm">
                  {formatCurrency(totalExpensePoisha)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Operating Balance Summary Line */}
        <div className="p-3.5 sm:p-4 rounded-lg border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:border-gray-800 print:rounded-none">
          <div>
            <p className="font-extrabold text-sm text-foreground print:text-gray-900">
              Net Financial Result (Schedule A − Schedule B)
            </p>
            <p className="text-[11px] text-muted-foreground print:text-gray-600">
              Surplus added to operating reserves, or deficit drawn from prior funds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`font-black text-base sm:text-lg font-mono tabular-nums ${
                isNetSurplus
                  ? "text-emerald-700 dark:text-emerald-400 print:text-gray-900"
                  : "text-rose-700 dark:text-rose-400 print:text-gray-900"
              }`}
            >
              {isNetSurplus ? "+" : ""}{formatCurrency(netSurplusPoisha)}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. Visual Overview: Proportional Horizontal Progress Bars           */}
      {/* =================================================================== */}
      {displayStyle === "visual" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:hidden">
          {/* Left Column: Where money came from */}
          <div className="bg-card p-4 sm:p-5 rounded-lg border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div>
                <h3 className="text-sm font-bold text-foreground">Where money came from</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total collected: {formatCurrency(totalIncomePoisha)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {incomeCategories.length} {incomeCategories.length === 1 ? "source" : "sources"}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {incomeCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No income recorded for this period.
                </p>
              ) : (
                displayedIncome.map((item, idx) => {
                  const amountPoisha = BigInt(item.amount || item.income || "0");
                  const pct =
                    totalIncomePoisha > 0n
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(Number((amountPoisha * 1000n) / totalIncomePoisha) / 10)
                          )
                        )
                      : 0;

                  return (
                    <div key={item.categoryId || idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground truncate max-w-[220px]">
                          {item.categoryName || item.name || "General Donations"}
                        </span>
                        <span className="font-bold text-foreground shrink-0 ml-2 font-mono tabular-nums">
                          {formatCurrency(amountPoisha)}{" "}
                          <span className="font-normal text-muted-foreground text-[11px]">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {incomeCategories.length > 5 && (
              <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Showing {showAllIncome ? `all ${incomeCategories.length}` : "top 5 sources"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllIncome(!showAllIncome)}
                  className="text-primary font-semibold hover:underline"
                >
                  {showAllIncome ? "Show top 5" : `Show all (${incomeCategories.length})`}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Where money went */}
          <div className="bg-card p-4 sm:p-5 rounded-lg border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <div>
                <h3 className="text-sm font-bold text-foreground">Where money went</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total spent: {formatCurrency(totalExpensePoisha)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {expenseCategories.length} {expenseCategories.length === 1 ? "category" : "categories"}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {expenseCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No expenses recorded for this period.
                </p>
              ) : (
                displayedExpenses.map((item, idx) => {
                  const amountPoisha = BigInt(item.amount || item.expense || "0");
                  const pct =
                    totalExpensePoisha > 0n
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(Number((amountPoisha * 1000n) / totalExpensePoisha) / 10)
                          )
                        )
                      : 0;

                  return (
                    <div key={item.categoryId || idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground truncate max-w-[220px]">
                          {item.categoryName || item.name || "General Expense"}
                        </span>
                        <span className="font-bold text-foreground shrink-0 ml-2 font-mono tabular-nums">
                          {formatCurrency(amountPoisha)}{" "}
                          <span className="font-normal text-muted-foreground text-[11px]">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {expenseCategories.length > 5 && (
              <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Showing {showAllExpense ? `all ${expenseCategories.length}` : "top 5 categories"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllExpense(!showAllExpense)}
                  className="text-primary font-semibold hover:underline"
                >
                  {showAllExpense ? "Show top 5" : `Show all (${expenseCategories.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
