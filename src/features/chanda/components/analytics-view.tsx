import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { DuesSummary } from "../types";
import { getDueStatusBadge } from "./dues-table";

interface AnalyticsViewProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  summaryData?: DuesSummary;
  isLoading: boolean;
}

export function AnalyticsView({
  selectedPeriod,
  onPeriodChange,
  summaryData,
  isLoading,
}: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs">
        <span className="text-sm font-semibold text-gray-700">Analytics Period</span>
        <input
          type="month"
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
        />
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          Loading dues analytics for {selectedPeriod}...
        </div>
      ) : !summaryData ? (
        <div className="py-16 text-center text-gray-500">
          No summary data available for {selectedPeriod}.
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                Total Expected
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summaryData.totalExpected)}
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                {summaryData.totalDuesCount} generated invoices
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
                Total Collected
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(summaryData.totalCollected)}
              </div>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">
                {summaryData.paidCount != null
                  ? `${summaryData.paidCount} paid in full`
                  : "Collections received"}
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-xs">
              <span className="text-xs font-semibold uppercase text-red-500 tracking-wider">
                Outstanding Balance
              </span>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summaryData.totalOutstanding)}
              </div>
              <span className="text-xs text-red-500 font-medium mt-1 block">
                {summaryData.defaulterCount ??
                  (summaryData.unpaidCount ?? 0) + (summaryData.partialCount ?? 0)}{" "}
                overdue/partial
              </span>
            </div>

            <div className="p-5 bg-[#E6F4F0] rounded-xl border border-[#006B5B]/20 shadow-xs">
              <span className="text-xs font-semibold uppercase text-[#006B5B] tracking-wider">
                Collection Rate
              </span>
              <div className="text-3xl font-black text-[#006B5B] mt-1">
                {String(summaryData.collectionRate).endsWith("%")
                  ? summaryData.collectionRate
                  : `${summaryData.collectionRate}%`}
              </div>
              <span className="text-xs text-[#006B5B] font-medium mt-1 block">
                Recovery efficiency
              </span>
            </div>
          </div>

          {/* Defaulters Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">
              Overdue Invoices & Defaulters ({summaryData.defaulters.length})
            </h3>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
              {summaryData.defaulters.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">Zero defaulters!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    All dues for {selectedPeriod} have been paid or waived.
                  </p>
                </div>
              ) : (
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Payer Name</Th>
                      <Th>Contact</Th>
                      <Th>Fund</Th>
                      <Th className="text-right">Billed</Th>
                      <Th className="text-right">Collected</Th>
                      <Th className="text-right">Overdue Remaining</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {summaryData.defaulters.map((defaulter) => (
                      <Tr key={defaulter.dueId}>
                        <Td className="font-semibold text-gray-900">
                          {defaulter.payerName}
                        </Td>
                        <Td className="text-xs text-gray-500">
                          {defaulter.member?.user?.phone ||
                            defaulter.member?.user?.email ||
                            "—"}
                        </Td>
                        <Td className="text-xs text-gray-600">
                          {defaulter.fund.name}
                        </Td>
                        <Td className="text-right text-gray-700 font-medium">
                          {formatCurrency(defaulter.amount)}
                        </Td>
                        <Td className="text-right text-emerald-700 font-medium">
                          {formatCurrency(defaulter.paidAmount)}
                        </Td>
                        <Td className="text-right font-bold text-red-600">
                          {formatCurrency(defaulter.remainingAmount)}
                        </Td>
                        <Td>{getDueStatusBadge(defaulter.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
