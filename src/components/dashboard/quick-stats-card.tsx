"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/money";

export interface QuickStatsData {
  boxCollectionsCount?: number;
  boxCollectionsTotal?: string;
  formattedBoxCollectionsTotal?: string;
  activeDonorsCount?: number;
  activeStaffCount?: number;
  activeCampaignsCount?: number;
}

interface QuickStatsCardProps {
  stats?: QuickStatsData;
}

export function QuickStatsCard({ stats }: QuickStatsCardProps) {
  const collectionTotal = stats?.boxCollectionsTotal
    ? formatCurrency(stats.boxCollectionsTotal, { showDecimals: false })
    : "৳0";

  const statItems = [
    {
      title: "Box Collections",
      val: stats?.boxCollectionsCount !== undefined ? String(stats.boxCollectionsCount) : "0",
      subtext: stats?.boxCollectionsTotal && stats.boxCollectionsTotal !== "0" ? collectionTotal : "All time",
    },
    {
      title: "Active Donors",
      val: stats?.activeDonorsCount !== undefined ? String(stats.activeDonorsCount) : "0",
      subtext: "This month",
    },
    {
      title: "Active Campaigns",
      val: stats?.activeCampaignsCount !== undefined ? String(stats.activeCampaignsCount) : "0",
      subtext: "Fundraising",
    },
    {
      title: "Mosque Staff",
      val: stats?.activeStaffCount !== undefined ? String(stats.activeStaffCount) : "0",
      subtext: "Oversight team",
    },
  ];

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-xl p-4 sm:p-4.5 box-border shadow-[0_2px_10px_rgba(16,60,48,0.05)] flex flex-col ">
      {/* Header */}
      <h2 className="text-[13px] font-bold text-foreground tracking-tight m-0 pb-5">
        Quick Stats
      </h2>

      {/* 2x2 Grid of Stat Boxes */}
      <div className="grid grid-cols-2 gap-2.5 ">
        {statItems.map((s) => (
          <div
            key={s.title}
            className="qs border border-[#E4ECE9] dark:border-border/80 rounded-[10px] p-2.5 flex flex-col gap-1 text-[10px] text-[#5E766E] dark:text-muted-foreground bg-[#F6FAF8]/50 dark:bg-muted/10 hover:border-primary/40 transition-colors"
          >
            <span className="truncate font-medium">{s.title}</span>
            <strong className="text-lg sm:text-[19px] font-bold text-[#12332B] dark:text-foreground font-mono leading-tight">
              {s.val}
            </strong>
            <span className="text-[10px] font-medium text-[#0B8A63] dark:text-emerald-400 truncate">
              {s.subtext}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
