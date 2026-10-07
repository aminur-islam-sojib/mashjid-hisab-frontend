"use client";

import * as React from "react";
import {
  MapPin,
  Sunrise,
  SunMedium,
  Sun,
  Sunset,
  Moon,
  Check,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PrayerSlot {
  name: string;
  time: string;
  status: "passed" | "active" | "upcoming";
  icon: React.ComponentType<{ className?: string }>;
}

const prayerList: PrayerSlot[] = [
  { name: "Fajr", time: "4:52 AM", status: "passed", icon: Sunrise },
  { name: "Dhuhr", time: "12:21 PM", status: "passed", icon: SunMedium },
  { name: "Asr", time: "3:45 PM", status: "active", icon: Sun },
  { name: "Maghrib", time: "6:02 PM", status: "upcoming", icon: Sunset },
  { name: "Isha", time: "7:32 PM", status: "upcoming", icon: Moon },
];

export function PrayerTimesCard() {
  return (
    <Card className="overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground">
              Prayer Times
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Al-Noor Mosque</span>
            </div>
          </div>
          <Badge variant="teal" className="text-xs font-medium">
            Today
          </Badge>
        </div>

        {/* 5 Daily Prayers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5">
          {prayerList.map((prayer) => {
            const Icon = prayer.icon;
            const isActive = prayer.status === "active";
            const isPassed = prayer.status === "passed";

            return (
              <div
                key={prayer.name}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                  isActive
                    ? "bg-secondary dark:bg-[#123b33] border-primary/40 text-primary shadow-xs ring-1 ring-primary/20"
                    : isPassed
                    ? "bg-muted/40 dark:bg-muted/20 border-border/60 text-muted-foreground"
                    : "bg-card border-border/80 text-foreground hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1.5",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-primary dark:text-[#39b89e]" : "text-foreground"
                  )}
                >
                  {prayer.name}
                </span>

                <span className="text-xs sm:text-[13px] font-bold mt-0.5 font-heading text-foreground">
                  {prayer.time}
                </span>

                <div className="mt-2">
                  {isPassed && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground font-medium">
                      <Check className="w-2.5 h-2.5 text-muted-foreground" />
                      Passed
                    </span>
                  )}
                  {isActive && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary dark:text-[#39b89e] bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" />
                      Now
                    </span>
                  )}
                  {!isPassed && !isActive && (
                    <span className="text-[10px] text-muted-foreground">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Islamic Verse (Ayah) Banner with Mosque Silhouette */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#e7f5f0] via-[#def0ea] to-[#d6ece4] dark:from-[#0a231e] dark:via-[#0e2a24] dark:to-[#12352f] border-t border-[#d5ebe3] dark:border-[#1d4039] p-5 text-center">
        {/* Subtle decorative mosque skyline */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 flex items-end justify-center"
          aria-hidden="true"
        >
          <svg viewBox="0 0 500 80" fill="currentColor" className="w-full text-primary">
            <path d="M 120 80 C 120 50 140 45 150 35 C 160 45 180 50 180 80 Z" />
            <rect x="180" y="30" width="8" height="50" rx="1" />
            <path d="M 230 80 C 230 40 260 30 275 20 C 290 30 320 40 320 80 Z" />
            <rect x="330" y="25" width="10" height="55" rx="1" />
            <path d="M 370 80 C 370 55 385 50 395 40 C 405 50 420 55 420 80 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-xl mx-auto space-y-1.5">
          {/* Arabic Calligraphy / Text */}
          <p
            dir="rtl"
            className="text-base sm:text-lg font-bold text-[#004f45] dark:text-[#55c8ae] font-serif leading-relaxed"
          >
            وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
          </p>

          {/* Translation */}
          <p className="text-xs text-muted-foreground leading-normal">
            And I did not create the jinn and mankind except that they may worship Me.
          </p>

          {/* Citation */}
          <p className="text-[11px] font-medium text-primary/80 dark:text-primary tracking-wide">
            — Quran 51:56
          </p>
        </div>
      </div>
    </Card>
  );
}

