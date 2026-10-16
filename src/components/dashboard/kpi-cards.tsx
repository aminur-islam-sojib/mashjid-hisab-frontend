"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Heart, CalendarCheck, Building } from "lucide-react";
import { formatCurrency } from "@/lib/money";

export interface DashboardKpiProps {
  totalMembers?: number;
  memberTrendPercentage?: number;
  monthlyIncome?: string | bigint;
  incomeTrendPercentage?: number;
  upcomingEventsCount?: number;
  totalFacilitiesCount?: number;
  mosqueId?: string;
}

export function KpiCards({
  totalMembers = 0,
  memberTrendPercentage = 0,
  monthlyIncome = "0",
  incomeTrendPercentage = 0,
  upcomingEventsCount = 0,
  totalFacilitiesCount = 0,
  mosqueId,
}: DashboardKpiProps) {
  const formattedIncome = React.useMemo(() => {
    return formatCurrency(monthlyIncome || "0", { showDecimals: false });
  }, [monthlyIncome]);

  const renderTrend = (pct: number) => {
    if (pct > 0) {
      return (
        <span className="text-[11px] font-semibold text-[#0B8A63] align-middle font-sans">
          ▲ +{pct}%
        </span>
      );
    }
    if (pct < 0) {
      return (
        <span className="text-[11px] font-semibold text-rose-600 align-middle font-sans">
          ▼ {pct}%
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-[#5E766E] dark:text-muted-foreground align-middle font-sans">
        — 0%
      </span>
    );
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Members */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-xl p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-[140px]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-foreground font-medium truncate">Total Members</div>
            <div className="text-[26px] font-bold text-foreground leading-tight mt-0.5">
              {totalMembers.toLocaleString()}{" "}
              {renderTrend(memberTrendPercentage)}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          Active members in the community
        </div>
      </div>

      {/* 2. Total Donations */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-xl p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-[140px]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-foreground font-medium truncate">Total Donations</div>
            <div className="text-[26px] font-bold text-foreground leading-tight mt-0.5 font-mono tabular-nums">
              {formattedIncome}{" "}
              {renderTrend(incomeTrendPercentage)}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          This month&apos;s collection
        </div>
      </div>

      {/* 3. Upcoming Events */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-xl p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-[140px]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-foreground font-medium truncate">Upcoming Events</div>
            <div className="flex items-baseline justify-between gap-1 mt-0.5">
              <span className="text-[26px] font-bold text-foreground leading-tight">
                {upcomingEventsCount}
              </span>
              <Link
                href={mosqueId ? `/mosques/${mosqueId}/campaigns` : "#"}
                className="text-[11px] text-[#5E766E] dark:text-muted-foreground hover:text-primary transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          Programs and activities
        </div>
      </div>

      {/* 4. Total Facilities / Funds & Accounts */}
      <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-xl p-5 pb-4 min-w-0 shadow-[0_2px_10px_rgba(16,60,48,0.05)] hover:border-primary/40 transition-all flex flex-col justify-between h-[140px]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-foreground font-medium truncate">Total Facilities</div>
            <div className="flex items-baseline justify-between gap-1 mt-0.5">
              <span className="text-[26px] font-bold text-foreground leading-tight">
                {totalFacilitiesCount}
              </span>
              <Link
                href={mosqueId ? `/mosques/${mosqueId}/accounts` : "#"}
                className="text-[11px] text-[#5E766E] dark:text-muted-foreground hover:text-primary transition-colors"
              >
                All facilities →
              </Link>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-[#5E766E] dark:text-muted-foreground mt-3 truncate">
          Mosque, wudu, classrooms etc.
        </div>
      </div>
    </section>
  );
}
