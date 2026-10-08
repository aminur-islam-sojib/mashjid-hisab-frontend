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
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-3 text-sm">
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
                {formatCurrency(data.totalIncome || "0")}
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
                {formatCurrency(data.totalExpenses || "0")}
              </div>
            </div>

            <div className="p-5 bg-[#E6F4F0] rounded-xl border border-[#006B5B]/20 shadow-xs">
              <div className="flex items-center space-x-2 text-[#006B5B] mb-1">
                <Landmark className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Net Surplus / (Deficit)
                </span>
              </div>
              <div className="text-2xl font-black text-[#006B5B]">
                {formatCurrency(data.netSavings || data.netSurplus || "0")}
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            <Table>
              <Thead>
                <Tr>
                  <Th>Line Item / Group</Th>
                  <Th className="text-right">Income</Th>
                  <Th className="text-right">Expense</Th>
                  <Th className="text-right">Net Flow</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(data.breakdown || data.items || []).map((item, idx) => (
                  <Tr key={idx}>
                    <Td className="font-semibold text-gray-900">
                      {item.label || item.name || item.group || `Period ${idx + 1}`}
                    </Td>
                    <Td className="text-right font-medium text-emerald-700">
                      {formatCurrency(item.income || "0")}
                    </Td>
                    <Td className="text-right font-medium text-red-700">
                      {formatCurrency(item.expense || "0")}
                    </Td>
                    <Td className="text-right font-bold text-[#006B5B]">
                      {formatCurrency(
                        (
                          BigInt(item.income || "0") - BigInt(item.expense || "0")
                        ).toString()
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

