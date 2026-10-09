import * as React from "react";
import { Landmark, PiggyBank, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { BalancesReport } from "../types";

interface BalancesViewProps {
  data?: BalancesReport;
  isLoading: boolean;
}

export function BalancesView({ data, isLoading }: BalancesViewProps) {
  const totalAccounts = data?.totalAccountsBalance || data?.totalAccountBalance || "0";
  const totalFunds = data?.totalFundsBalance || data?.totalFundBalance || "0";
  const isReconciled = BigInt(totalAccounts) === BigInt(totalFunds);

  return (
    <div className="space-y-6">
      {/* Print-only Statement Header */}
      <div className="hidden print:block pb-4 mb-2 border-b border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Statement of Financial Position (Balance Sheet)
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
          <span>
            As of: {data?.asOf ? new Date(data.asOf).toLocaleDateString() : new Date().toLocaleDateString()}
          </span>
          <span>Printed on: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-gray-500">
          Calculating fund and account balances...
        </div>
      ) : !data ? (
        <div className="py-16 text-center text-gray-500">
          No balance sheet data returned.
        </div>
      ) : (
        <>
          {/* Asset Accounts vs Fund Allocations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts (Assets) */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-gray-900 font-bold">
                  <Landmark className="w-5 h-5 text-[#006B5B]" />
                  <span>Financial Accounts (Assets)</span>
                </div>
                <span className="text-lg font-black text-[#006B5B]">
                  {formatCurrency(totalAccounts)}
                </span>
              </div>

              <div className="space-y-2">
                {(data.accounts || []).length === 0 ? (
                  <div className="text-xs text-gray-400 py-3 text-center">
                    No active accounts found.
                  </div>
                ) : (
                  (data.accounts || []).map((acct) => (
                    <div
                      key={acct.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          {acct.name}
                        </span>
                        <span className="text-xs text-gray-400">{acct.type}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(acct.balance || acct.currentBalance || "0")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Funds (Equity) */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-gray-900 font-bold">
                  <PiggyBank className="w-5 h-5 text-[#006B5B]" />
                  <span>Fund Allocations (Equity)</span>
                </div>
                <span className="text-lg font-black text-[#006B5B]">
                  {formatCurrency(totalFunds)}
                </span>
              </div>

              <div className="space-y-2">
                {(data.funds || []).length === 0 ? (
                  <div className="text-xs text-gray-400 py-3 text-center">
                    No active funds found.
                  </div>
                ) : (
                  (data.funds || []).map((fund) => (
                    <div
                      key={fund.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          {fund.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {fund.isRestricted ? "Restricted Fund" : "Unrestricted"}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(fund.balance || fund.currentBalance || "0")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Integrity Indicator */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
              isReconciled
                ? "bg-[#E6F4F0] border-[#006B5B]/30 text-[#006B5B]"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">
                Double-Entry Balance Verification Check
              </span>
            </div>
            <span className="text-xs font-medium">
              {isReconciled
                ? "Ledger reconciled: Total Accounts = Total Funds"
                : `Variance detected: Accounts (${formatCurrency(totalAccounts)}) vs Funds (${formatCurrency(totalFunds)})`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

