"use client";

import * as React from "react";
import { Landmark, PiggyBank, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { BalancesReport } from "../types";
import { Badge } from "@/components/ui/badge";

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
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          Calculating fund and depository account balances...
        </div>
      ) : !data ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          No balance sheet data returned.
        </div>
      ) : (
        <>
          {/* Dual-Column Statement: Assets vs Fund Equity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Assets / Depository Accounts */}
            <div className="bg-card rounded-lg border border-border shadow-xs p-4 sm:p-5 space-y-3.5 print:border-gray-800 print:rounded-none">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary print:border print:border-gray-800">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground tracking-tight">
                      Depository Assets (Cash & Bank)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Where mosque funds are physically kept</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-foreground font-sans tabular-nums print:text-gray-900">
                  {formatCurrency(totalAccounts)}
                </span>
              </div>

              <div className="space-y-1.5">
                {(data.accounts || []).length === 0 ? (
                  <div className="text-xs text-muted-foreground py-6 text-center">
                    No active accounts found.
                  </div>
                ) : (
                  (data.accounts || []).map((acct) => (
                    <div
                      key={acct.id}
                      className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors text-xs print:bg-transparent print:border-gray-200"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-foreground truncate block">
                          {acct.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {acct.type}
                        </span>
                      </div>
                      <span className="font-bold text-foreground font-sans tabular-nums shrink-0">
                        {formatCurrency(acct.balance || acct.currentBalance || "0")}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Total Summary Row */}
              <div className="pt-3 border-t-2 border-border/90 flex items-center justify-between text-xs font-bold text-foreground print:border-gray-800">
                <span>Total Assets in Vaults & Banks</span>
                <span className="font-sans tabular-nums text-sm">
                  {formatCurrency(totalAccounts)}
                </span>
              </div>
            </div>

            {/* Right Column: Fund Equity & Reserves */}
            <div className="bg-card rounded-lg border border-border shadow-xs p-4 sm:p-5 space-y-3.5 print:border-gray-800 print:rounded-none">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 print:border print:border-gray-800">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground tracking-tight">
                      Fund Reserves (Equity & Purpose)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">What the mosque money is allocated for</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-foreground font-sans tabular-nums print:text-gray-900">
                  {formatCurrency(totalFunds)}
                </span>
              </div>

              <div className="space-y-1.5">
                {(data.funds || []).length === 0 ? (
                  <div className="text-xs text-muted-foreground py-6 text-center">
                    No active funds found.
                  </div>
                ) : (
                  (data.funds || []).map((fund) => (
                    <div
                      key={fund.id}
                      className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors text-xs print:bg-transparent print:border-gray-200"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate block">
                            {fund.name}
                          </span>
                          {fund.isRestricted && (
                            <Badge variant="gold" className="text-[9px] px-1.5 py-0 h-4 rounded">
                              Restricted
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {fund.type || (fund.isRestricted ? "RESTRICTED FUND" : "UNRESTRICTED / GENERAL")}
                        </span>
                      </div>
                      <span className="font-bold text-foreground font-sans tabular-nums shrink-0">
                        {formatCurrency(fund.balance || fund.currentBalance || "0")}
                      </span>
                    </div>
                  ))
                )}

                {/* Unallocated Row - displayed only when non-zero */}
                {data.unallocated && data.unallocated !== "0" && (
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-destructive/10 border border-destructive/30 text-xs">
                    <div>
                      <span className="font-bold text-destructive block">
                        Unallocated Balance
                      </span>
                      <span className="text-[10px] text-destructive/80">
                        Physical account balances exceeding assigned funds
                      </span>
                    </div>
                    <span className="font-extrabold text-destructive font-sans tabular-nums">
                      {formatCurrency(data.unallocated)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Summary Row */}
              <div className="pt-3 border-t-2 border-border/90 flex items-center justify-between text-xs font-bold text-foreground print:border-gray-800">
                <span>Total Fund Allocations</span>
                <span className="font-sans tabular-nums text-sm">
                  {formatCurrency(totalFunds)}
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Audit Verification Certificate */}
          <div
            className={`p-3.5 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all print:border-gray-800 print:bg-transparent ${
              isReconciled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                : "bg-destructive/10 border-destructive/30 text-destructive dark:text-destructive"
            }`}
          >
            <div className="flex items-center gap-3">
              {isReconciled ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              )}
              <div>
                <p className="font-bold text-xs sm:text-sm">
                  {isReconciled
                    ? "Accounting Invariant Verified: Assets Balance Exactly Matches Funds"
                    : "Balance Sheet Discrepancy Detected"}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Invariant Check: Total Assets ({formatCurrency(totalAccounts)}) = Total Funds ({formatCurrency(totalFunds)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="px-2.5 py-1 rounded-md bg-card/80 border border-border shadow-2xs print:border-gray-800 font-sans tabular-nums">
                Variance: {isReconciled ? "৳0.00" : formatCurrency(data.unallocated || "0")}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
