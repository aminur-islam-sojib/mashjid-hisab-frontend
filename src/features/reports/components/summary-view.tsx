import * as React from "react";
import { formatCurrency } from "@/lib/money";
import { IncomeExpenseReport } from "../types";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";

interface SummaryViewProps {
  data?: IncomeExpenseReport;
  isLoading: boolean;
  startDate: string;
  endDate: string;
}

export function SummaryView({
  data,
  isLoading,
  startDate,
  endDate,
}: SummaryViewProps) {
  const [showAllIncome, setShowAllIncome] = React.useState(false);
  const [showAllExpense, setShowAllExpense] = React.useState(false);

  const totalIncomePoisha = BigInt(data?.totalIncome || "0");
  const totalExpensePoisha = BigInt(data?.totalExpense || data?.totalExpenses || "0");

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
      <div className="py-16 text-center text-muted-foreground text-sm">
        Generating financial summary...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        No statement data available for the selected range.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* Printable Financial Statement (Print-only)                          */}
      {/* =================================================================== */}
      <div className="hidden print:block pb-4 mb-4 border-b border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Statement of Income & Expenditures
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
          <span>
            Period: {startDate} to {endDate}
          </span>
          <span>Printed on: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="mt-6 space-y-6">
          {/* Income Table */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Income Sources</h3>
            <Table>
              <Thead>
                <Tr>
                  <Th>Category / Source</Th>
                  <Th className="text-center">Entries</Th>
                  <Th className="text-right">Total Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {incomeCategories.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} className="text-center text-gray-500 py-3">
                      No income records in this period.
                    </Td>
                  </Tr>
                ) : (
                  incomeCategories.map((cat, idx) => (
                    <Tr key={cat.categoryId || idx}>
                      <Td className="font-medium text-gray-900">
                        {cat.categoryName || cat.name || "General"}
                      </Td>
                      <Td className="text-center text-xs text-gray-500">
                        {cat.count ?? 1}
                      </Td>
                      <Td className="text-right font-semibold text-gray-900">
                        {formatCurrency(cat.amount || cat.income || "0")}
                      </Td>
                    </Tr>
                  ))
                )}
                <Tr className="font-bold border-t-2 border-gray-300">
                  <Td>Total Income</Td>
                  <Td className="text-center">
                    {incomeCategories.reduce((acc, c) => acc + (c.count ?? 1), 0)}
                  </Td>
                  <Td className="text-right">{formatCurrency(totalIncomePoisha)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </div>

          {/* Expense Table */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Expenditures</h3>
            <Table>
              <Thead>
                <Tr>
                  <Th>Category / Purpose</Th>
                  <Th className="text-center">Entries</Th>
                  <Th className="text-right">Total Amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expenseCategories.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} className="text-center text-gray-500 py-3">
                      No expense records in this period.
                    </Td>
                  </Tr>
                ) : (
                  expenseCategories.map((cat, idx) => (
                    <Tr key={cat.categoryId || idx}>
                      <Td className="font-medium text-gray-900">
                        {cat.categoryName || cat.name || "General Expense"}
                      </Td>
                      <Td className="text-center text-xs text-gray-500">
                        {cat.count ?? 1}
                      </Td>
                      <Td className="text-right font-semibold text-gray-900">
                        {formatCurrency(cat.amount || cat.expense || "0")}
                      </Td>
                    </Tr>
                  ))
                )}
                <Tr className="font-bold border-t-2 border-gray-300">
                  <Td>Total Expenses</Td>
                  <Td className="text-center">
                    {expenseCategories.reduce((acc, c) => acc + (c.count ?? 1), 0)}
                  </Td>
                  <Td className="text-right">{formatCurrency(totalExpensePoisha)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* On-screen Bar Lists: "Where money came from" & "Where money went"   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">

        {/* 1. Left Column: Where money came from */}
        <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
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

          {/* Proportional Bar List */}
          <div className="space-y-3 pt-2">
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
                      <span className="font-bold text-foreground shrink-0 ml-2">
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

          {/* Show all / Show top 5 toggle */}
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

        {/* 2. Right Column: Where money went */}
        <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
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

          {/* Proportional Bar List */}
          <div className="space-y-3 pt-2">
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
                      <span className="font-bold text-foreground shrink-0 ml-2">
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

          {/* Show all / Show top 5 toggle */}
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
    </div>
  );
}

