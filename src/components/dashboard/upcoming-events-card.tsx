"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/money";

export interface RawUpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  targetAmount?: string | null;
  formattedTargetAmount?: string | null;
  raisedAmount?: string;
  formattedRaisedAmount?: string;
}

export interface UpcomingEventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  timeRange: string;
}

interface UpcomingEventsCardProps {
  events?: (UpcomingEventItem | RawUpcomingEvent)[];
  mosqueId?: string;
}

export function UpcomingEventsCard({
  events = [],
  mosqueId,
}: UpcomingEventsCardProps) {
  const displayEvents: UpcomingEventItem[] = React.useMemo(() => {
    if (!events || events.length === 0) return [];

    return events.map((item) => {
      if ("day" in item && "month" in item) {
        return item as UpcomingEventItem;
      }
      const raw = item as RawUpcomingEvent;
      const d = new Date(raw.startDate);
      const day = isNaN(d.getDate()) ? "1" : String(d.getDate());
      const month = isNaN(d.getMonth())
        ? "OCT"
        : d.toLocaleString("en-US", { month: "short" }).toUpperCase();

      let timeRange = "Fundraising Drive";
      if (raw.targetAmount && raw.targetAmount !== "0") {
        timeRange = `Target: ${formatCurrency(raw.targetAmount, { showDecimals: false })}`;
      } else if (raw.endDate) {
        const endD = new Date(raw.endDate);
        timeRange = `Until ${endD.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }

      return {
        id: raw.id,
        day,
        month,
        title: raw.title,
        timeRange,
      };
    });
  }, [events]);

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-2xl p-5 box-border shadow-[0_2px_10px_rgba(16,60,48,0.05)] flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-[15px] font-bold text-foreground tracking-tight m-0">
          Upcoming Events
        </h2>
        <Link
          href={mosqueId ? `/mosques/${mosqueId}/campaigns` : "#"}
          className="text-[11px] text-[#5E766E] dark:text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          View all →
        </Link>
      </div>

      {/* Events List or Empty State */}
      {displayEvents.length > 0 ? (
        <div className="divide-y divide-[#EDF2F0] dark:divide-border/60">
          {displayEvents.map((evt) => (
            <Link
              key={evt.id}
              href={mosqueId ? `/mosques/${mosqueId}/campaigns` : "#"}
              className="ev flex items-center gap-3 py-2.5 transition-colors group cursor-pointer"
            >
              {/* Date Badge */}
              <div className="dt w-10.5 h-11.5 rounded-[10px] bg-[#F2F8F5] dark:bg-emerald-950/40 flex flex-col items-center justify-center text-[10px] text-[#2F4A42] dark:text-emerald-300 shrink-0 font-medium leading-none">
                <span className="text-[16px] font-bold text-[#12332B] dark:text-emerald-100 font-mono mb-0.5">
                  {evt.day}
                </span>
                <span>{evt.month}</span>
              </div>

              {/* Title & Time */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#12332B] dark:text-emerald-100 group-hover:text-primary transition-colors truncate">
                  {evt.title}
                </div>
                <div className="text-[11px] text-[#5E766E] dark:text-muted-foreground mt-0.5 font-normal truncate">
                  {evt.timeRange}
                </div>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-4 h-4 text-[#5E766E] dark:text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center space-y-2 flex-1 flex flex-col justify-center">
          <div className="w-9 h-9 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-foreground">No upcoming campaigns</p>
          <p className="text-[10px] text-muted-foreground">Launch fundraising campaigns or community drives.</p>
          {mosqueId && (
            <Link href={`/mosques/${mosqueId}/campaigns`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-1">
                <Plus className="w-3 h-3" />
                Schedule Campaign
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
