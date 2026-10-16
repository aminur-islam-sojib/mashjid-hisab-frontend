"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { DonorsReport, DonorGroupBy, DonorStatus } from "../types";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, HeartHandshake, Filter } from "lucide-react";

interface DonorsViewProps {
  donorGroupBy: DonorGroupBy;
  donorStatus: DonorStatus;
  onDonorGroupByChange: (val: DonorGroupBy) => void;
  onDonorStatusChange: (val: DonorStatus) => void;
  data?: DonorsReport;
  isLoading: boolean;
}

export function DonorsView({
  donorGroupBy,
  donorStatus,
  onDonorGroupByChange,
  onDonorStatusChange,
  data,
  isLoading,
}: DonorsViewProps) {
  const donorList = data?.topDonors || data?.donors || data?.data || [];
  const totalDonorsCount = data?.totalDonorsCount ?? donorList.length;
  const totalDonationsCount = data?.totalDonationsCount;
  const totalGiving = data?.totalGiving;

  return (
    <div className="space-y-5">
      {/* Controls Bar (Hidden during printing) */}
      <div className="p-3 bg-card rounded-lg border border-border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Group By:</span>
          </div>
          <select
            value={donorGroupBy}
            onChange={(e) => onDonorGroupByChange(e.target.value as DonorGroupBy)}
            className="h-8 px-2.5 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-medium"
          >
            <option value="member">Individual Member Donors</option>
            <option value="family">Family / Household Giving</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Scope:</span>
          <select
            value={donorStatus}
            onChange={(e) => onDonorStatusChange(e.target.value as DonorStatus)}
            className="h-8 px-2.5 text-xs border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground font-medium"
          >
            <option value="top">Top Ranked Donors</option>
            <option value="all">All Contributing Donors</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {Boolean(totalGiving || totalDonorsCount) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <div className="p-3.5 sm:p-4 bg-card rounded-lg border border-border shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Contributing Donors
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono tabular-nums">
                {totalDonorsCount}
              </div>
            </div>
          </div>

          {totalDonationsCount !== undefined && (
            <div className="p-3.5 sm:p-4 bg-card rounded-lg border border-border shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Contribution Receipts
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono tabular-nums">
                  {totalDonationsCount}
                </div>
              </div>
            </div>
          )}

          {totalGiving && (
            <div className="p-3.5 sm:p-4 bg-card rounded-lg border border-emerald-500/30 bg-emerald-500/5 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Total Contributions
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                  {formatCurrency(totalGiving)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Donor Registry Table */}
      <div className="bg-card rounded-lg border border-border shadow-xs overflow-hidden print:border-gray-800 print:rounded-none">
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Compiling donor registry & rankings...
          </div>
        ) : donorList.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            No donor contribution records found for the selected criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Donor / Benefactor Name</TableHead>
                <TableHead className="text-right">Receipts Count</TableHead>
                <TableHead className="text-right">Total Contributed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donorList.map((d, idx) => (
                <TableRow key={d.id || idx}>
                  <TableCell className="font-mono text-xs">
                    {idx === 0 ? (
                      <Badge variant="gold" className="text-[10px] px-1.5 py-0 h-4.5 rounded">#1</Badge>
                    ) : idx === 1 ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5 rounded">#2</Badge>
                    ) : idx === 2 ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5 rounded">#3</Badge>
                    ) : (
                      <span className="text-muted-foreground font-semibold">#{idx + 1}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground text-xs">
                    <div>
                      <span>{d.name || d.donorName || "Congregant"}</span>
                      {d.phone && (
                        <span className="block text-[11px] font-normal text-muted-foreground font-mono mt-0.5">
                          {d.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums">
                    {d.donationCount || d.count || 1}
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-foreground font-mono tabular-nums text-xs">
                    {formatCurrency(d.totalGiven || d.totalAmount || "0")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
