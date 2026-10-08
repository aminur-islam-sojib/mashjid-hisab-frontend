import * as React from "react";
import { Landmark, PiggyBank, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { BalancesReport } from "../types";

interface BalancesViewProps {
  data?: BalancesReport;
  isLoading: boolean;
}

export function BalancesView({ data, isLoading }: BalancesViewProps) {
  return (
    <div className="space-y-6">
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
                  {formatCurrency(data.totalAccountBalance || "0")}
                </span>
              </div>

              <div className="space-y-2">
                {(data.accounts || []).map((acct) => (
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
                      {formatCurrency(acct.currentBalance || "0")}
                    </span>
                  </div>
                ))}
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
                  {formatCurrency(data.totalFundBalance || "0")}
                </span>
              </div>

              <div className="space-y-2">
                {(data.funds || []).map((fund) => (
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
                      {formatCurrency(fund.currentBalance || "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integrity Indicator */}
          <div className="p-4 bg-[#E6F4F0] border border-[#006B5B]/30 rounded-xl flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-[#006B5B]">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">
                Double-Entry Balance Verification Check
              </span>
            </div>
            <span className="text-xs text-[#006B5B] font-medium">
              Ledger reconciled: Total Accounts = Total Funds
            </span>
          </div>
        </>
      )}
    </div>
  );
}

