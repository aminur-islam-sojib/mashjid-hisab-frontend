"use client";

import * as React from "react";
import {
  Landmark,
  BookOpen,
  Users2,
  Mic2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

const defaultEvents: EventItem[] = [
  {
    id: "1",
    day: "12",
    month: "OCT",
    title: "Friday Jummah",
    time: "1:00 PM – 2:00 PM",
    icon: Landmark,
  },
  {
    id: "2",
    day: "16",
    month: "OCT",
    title: "Quran Hifz Class",
    time: "4:00 PM – 5:30 PM",
    icon: BookOpen,
  },
  {
    id: "3",
    day: "20",
    month: "OCT",
    title: "Community Iftar",
    time: "6:00 PM – 8:00 PM",
    icon: Users2,
  },
  {
    id: "4",
    day: "25",
    month: "OCT",
    title: "Islamic Lecture",
    time: "4:30 PM – 6:00 PM",
    icon: Mic2,
  },
];

export function UpcomingEventsCard({ events = defaultEvents }: { events?: EventItem[] }) {
  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground">
          Upcoming Events
        </h3>
        <a
          href="#events"
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-0.5 hover:underline"
        >
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Events List */}
      <div className="divide-y divide-border/60 mt-1">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div
              key={event.id}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-muted/40 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Date Block */}
                <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#123b33] border border-primary/20 flex flex-col items-center justify-center shrink-0 leading-none">
                  <span className="text-xs font-bold text-primary dark:text-[#39b89e]">
                    {event.day}
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase mt-0.5">
                    {event.month}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-card text-primary flex items-center justify-center border border-border shadow-2xs shrink-0 hidden sm:flex">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {event.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

