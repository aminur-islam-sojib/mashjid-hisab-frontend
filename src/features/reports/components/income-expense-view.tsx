import * as React from "react";
import { TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { IncomeExpenseReport, IncomeExpenseGroupBy } from "../types";

interface IncomeExpenseViewProps {
  startDate: string;
  endDate: string;
  groupBy: IncomeExpenseGroupBy;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onGroupByChange: (val: IncomeExpenseGroupBy) => void;
  data?: IncomeExpenseReport;
  isLoading: boolean;
}

export function IncomeExpenseView({
  startDate,
  endDate,
  groupBy,
  onStartDateChange,
  onEndDateChange,
  onGroupByChange,
  data,
  isLoading,
}: IncomeExpenseViewProps) {
  const totalIncomeVal = data?.totalIncome || "0";
  const totalExpenseVal = data?.totalExpense || data?.totalExpenses || "0";
  const netSurplusVal = data?.netSurplus || data?.netSavings || "0";
  const isNetPositive = !netSurplusVal.startsWith("-");

  // Determine items to display
  const hasCategories =
    Boolean(data?.incomeCategories?.length) || Boolean(data?.expenseCategories?.length);
  const dataList = data?.data || data?.breakdown || data?.items || [];

  return (
    <div className="space-y-6">
      {/* Print-only Statement Header */}
      <div className="hidden print:block pb-4 mb-2 border-b border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Statement of Income & Expenditures
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
          <span>
            Period: {startDate} to {endDate} &bull; Grouping: {groupBy.toUpperCase()}
          </span>
          <span>Printed on: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Controls Bar (Hidden during printing) */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-3 text-sm print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Group By:</span>
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as IncomeExpenseGroupBy)}
            className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="category">Category</option>
            <option value="fund">Fund</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          Generating income & expense statement...
        </div>
      ) : !data ? (
        <div className="py-16 text-center text-gray-500">
          No statement data available for the selected range.
        </div>
      ) : (
        <>
          {/* Summary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center space-x-2 text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Income
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {formatCurrency(totalIncomeVal)}
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center space-x-2 text-red-600 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Expenses
                </span>
              </div>
              <div className="text-2xl font-black text-red-700">
                {formatCurrency(totalExpenseVal)}
              </div>
            </div>

            <div className={`p-5 rounded-xl border shadow-xs ${
              isNetPositive
                ? "bg-[#E6F4F0] border-[#006B5B]/20 text-[#006B5B]"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Landmark className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {isNetPositive ? "Net Surplus" : "Net Deficit"}
                </span>
              </div>
              <div className="text-2xl font-black">
                {formatCurrency(netSurplusVal)}
              </div>
            </div>
          </div>

          {/* Breakdown: Group By Category */}
          {groupBy === "category" && (
            <div className="space-y-6">
              {/* Income Categories Table */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-emerald-50/50 border-b border-gray-200/80 flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-900">
                    Income Categories
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    Total: {formatCurrency(totalIncomeVal)}
                  </span>
                </div>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Category Name</Th>
                      <Th className="text-center">Entries</Th>
                      <Th className="text-right">Total Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(data.incomeCategories || []).length === 0 ? (
                      <Tr>
                        <Td colSpan={3} className="text-center text-gray-500 py-6">
                          No income records in this period.
                        </Td>
                      </Tr>
                    ) : (
                      (data.incomeCategories || []).map((cat, idx) => (
                        <Tr key={cat.categoryId || idx}>
                          <Td className="font-semibold text-gray-900">
                            {cat.categoryName || cat.name || "General"}
                          </Td>
                          <Td className="text-center text-xs text-gray-500">
                            {cat.count ?? 1} donations
                          </Td>
                          <Td className="text-right font-medium text-emerald-700">
                            {formatCurrency(cat.amount || cat.income || "0")}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </div>

              {/* Expense Categories Table */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-red-50/50 border-b border-gray-200/80 flex items-center justify-between">
                  <span className="font-bold text-sm text-red-900">
                    Expense Categories
                  </span>
                  <span className="text-xs font-semibold text-red-700">
                    Total: {formatCurrency(totalExpenseVal)}
                  </span>
                </div>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Category Name</Th>
                      <Th className="text-center">Entries</Th>
                      <Th className="text-right">Total Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(data.expenseCategories || []).length === 0 ? (
                      <Tr>
                        <Td colSpan={3} className="text-center text-gray-500 py-6">
                          No expense records in this period.
                        </Td>
                      </Tr>
                    ) : (
                      (data.expenseCategories || []).map((cat, idx) => (
                        <Tr key={cat.categoryId || idx}>
                          <Td className="font-semibold text-gray-900">
                            {cat.categoryName || cat.name || "General Expense"}
                          </Td>
                          <Td className="text-center text-xs text-gray-500">
                            {cat.count ?? 1} entries
                          </Td>
                          <Td className="text-right font-medium text-red-700">
                            {formatCurrency(cat.amount || cat.expense || "0")}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </div>
            </div>
          )}

          {/* Breakdown: Group By Fund */}
          {groupBy === "fund" && (
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Fund Name</Th>
                    <Th>Fund Type</Th>
                    <Th className="text-right">Income</Th>
                    <Th className="text-right">Expense</Th>
                    <Th className="text-right">Net Flow</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataList.length === 0 ? (
                    <Tr>
                      <Td colSpan={5} className="text-center text-gray-500 py-6">
                        No fund activity found for the selected range.
                      </Td>
                    </Tr>
                  ) : (
                    dataList.map((item: any, idx: number) => (
                      <Tr key={item.fundId || idx}>
                        <Td className="font-semibold text-gray-900">
                          {item.fundName || item.name || `Fund ${idx + 1}`}
                        </Td>
                        <Td className="text-xs text-gray-500">
                          {item.fundType || "GENERAL"}
                        </Td>
                        <Td className="text-right font-medium text-emerald-700">
                          {formatCurrency(item.income || "0")}
                        </Td>
                        <Td className="text-right font-medium text-red-700">
                          {formatCurrency(item.expense || "0")}
                        </Td>
                        <Td className="text-right font-bold text-[#006B5B]">
                          {formatCurrency(
                            item.net ||
                              (
                                BigInt(item.income || "0") - BigInt(item.expense || "0")
                              ).toString()
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </div>
          )}

          {/* Breakdown: Group By Month */}
          {groupBy === "month" && (
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Accounting Month</Th>
                    <Th className="text-right">Income</Th>
                    <Th className="text-right">Expense</Th>
                    <Th className="text-right">Net Surplus / (Deficit)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataList.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} className="text-center text-gray-500 py-6">
                        No monthly activity recorded for this period.
                      </Td>
                    </Tr>
                  ) : (
                    dataList.map((item: any, idx: number) => (
                      <Tr key={item.month || idx}>
                        <Td className="font-semibold text-gray-900">
                          {item.month || `Period ${idx + 1}`}
                        </Td>
                        <Td className="text-right font-medium text-emerald-700">
                          {formatCurrency(item.income || "0")}
                        </Td>
                        <Td className="text-right font-medium text-red-700">
                          {formatCurrency(item.expense || "0")}
                        </Td>
                        <Td className="text-right font-bold text-[#006B5B]">
                          {formatCurrency(
                            item.net ||
                              (
                                BigInt(item.income || "0") - BigInt(item.expense || "0")
                              ).toString()
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

