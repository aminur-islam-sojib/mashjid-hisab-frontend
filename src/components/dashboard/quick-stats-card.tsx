"use client";

import * as React from "react";
import { Users, Landmark, BookOpen, HandHeart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function QuickStatsCard() {
  const stats = [
    {
      title: "Jummah Attendees",
      value: "320",
      change: "+12%",
      icon: Users,
    },
    {
      title: "Daily Prayers",
      value: "1,240",
      change: "+8%",
      icon: Landmark,
    },
    {
      title: "Quran Classes",
      value: "48",
      change: "+15%",
      icon: BookOpen,
    },
    {
      title: "Active Volunteers",
      value: "22",
      change: "+10%",
      icon: HandHeart,
    },
  ];

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="pb-3 border-b border-border/60">
        <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground">
          Quick Stats
        </h3>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="p-3.5 rounded-xl border border-border/80 bg-muted/20 dark:bg-muted/10 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-[11px] font-medium text-muted-foreground truncate">
                {stat.title}
              </p>

              <div className="flex items-baseline justify-between gap-1 mt-1">
                <span className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  {stat.value}
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

