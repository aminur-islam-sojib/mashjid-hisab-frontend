"use client";

import * as React from "react";
import Link from "next/link";
import { PiggyBank, Plus } from "lucide-react";

export interface FundAllocationItem {
  id: string;
  name: string;
  type: string;
  isRestricted: boolean;
  balance: string;
  formattedBalance?: string;
  percentage: number;
}

export interface FundAllocationData {
  totalBalance?: string;
  formattedTotalBalance?: string;
  overallAllocationPercentage?: number;
  funds?: FundAllocationItem[];
}

interface FacilityUsageCardProps {
  fundAllocation?: FundAllocationData;
  mosqueId?: string;
}

const PALETTE = ["#0B3F32", "#0B8A63", "#2FB58A", "#7FD1B5", "#3E7BD6", "#B89A5A"];

export function FacilityUsageCard({
  fundAllocation,
  mosqueId,
}: FacilityUsageCardProps) {
  const funds = fundAllocation?.funds || [];
  const overallPct = Math.round(fundAllocation?.overallAllocationPercentage ?? 100);

  // Circumference = 2 * PI * 50 = 314.159
  const dashLength = Math.max(0, Math.min(314, Math.round((overallPct * 314) / 100)));

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-2xl p-4 sm:p-4.5 box-border shadow-[0_2px_10px_rgba(16,60,48,0.05)] flex flex-col ">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-[13px] font-bold text-foreground tracking-tight m-0">
          Fund Allocation
        </h2>
        <Link
          href={mosqueId ? `/mosques/${mosqueId}/funds` : "#"}
          className="text-[11px] text-[#5E766E] dark:text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          Manage →
        </Link>
      </div>

      {/* Donut Gauge & Legend */}
      {funds.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mt-4">
          {/* Radial SVG Donut Gauge */}
          <div className="relative w-29.5 h-29.5 shrink-0">
            <svg
              width="118"
              height="118"
              viewBox="0 0 118 118"
              className="w-full h-full"
              role="img"
              aria-label={`Overall allocation ${overallPct}%`}
            >
              <g transform="rotate(-90 59 59)" fill="none" strokeWidth="12">
                <circle
                  cx="59"
                  cy="59"
                  r="50"
                  stroke="#E3EFEA"
                  className="dark:stroke-border"
                />
                <circle
                  cx="59"
                  cy="59"
                  r="50"
                  stroke="#0B8A63"
                  strokeLinecap="round"
                  strokeDasharray={`${dashLength} 314`}
                />
              </g>
              <text
                x="59"
                y="62"
                textAnchor="middle"
                fontSize="22"
                fontWeight="700"
                fill="#12332B"
                className="dark:fill-white font-mono"
              >
                {overallPct}%
              </text>
              <text
                x="59"
                y="77"
                textAnchor="middle"
                fontSize="8"
                fill="#5E766E"
                className="dark:fill-muted-foreground uppercase tracking-wider font-semibold"
              >
                Allocated
              </text>
            </svg>
          </div>

          {/* Legend Breakdown */}
          <div className="flex-1 w-full space-y-2">
            {funds.slice(0, 5).map((f, idx) => (
              <div
                key={f.id || f.name}
                className="flex justify-between items-center text-[11px] text-[#2F4A42] dark:text-muted-foreground"
              >
                <span className="flex items-center truncate">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2 shrink-0"
                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                  />
                  <span className="truncate">{f.name}</span>
                </span>
                <span className="font-semibold text-foreground font-mono tabular-nums ml-2">
                  {f.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center space-y-2 flex-1 flex flex-col justify-center">
          <div className="w-9 h-9 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center mx-auto">
            <PiggyBank className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-foreground">No funds created</p>
          <p className="text-[10px] text-muted-foreground">Define funds (General, Zakat, etc.) to allocate treasury.</p>
          {mosqueId && (
            <Link href={`/mosques/${mosqueId}/funds`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-1">
                <Plus className="w-3 h-3" />
                Add Fund
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
