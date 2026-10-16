"use client";

import * as React from "react";
import { Sunrise, Sun, Sunset, Moon, MapPin } from "lucide-react";

interface PrayerTimesCardProps {
  mosqueName?: string;
}

interface PrayerTime {
  name: string;
  time: string;
  status: "passed" | "now" | "upcoming";
  icon: React.ComponentType<{ className?: string }>;
}

export function PrayerTimesCard({ mosqueName = "Al-Noor Mosque" }: PrayerTimesCardProps) {
  // Compute prayer statuses relative to current time
  const prayers: PrayerTime[] = React.useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Standard schedule times in minutes
    // Fajr: 4:52 AM (292), Dhuhr: 12:21 PM (741), Asr: 3:45 PM (945), Maghrib: 6:02 PM (1082), Isha: 7:32 PM (1172)
    const schedule = [
      { name: "Fajr", time: "4:52 AM", minutes: 292, icon: Sunrise },
      { name: "Dhuhr", time: "12:21 PM", minutes: 741, icon: Sun },
      { name: "Asr", time: "3:45 PM", minutes: 945, icon: Sun },
      { name: "Maghrib", time: "6:02 PM", minutes: 1082, icon: Sunset },
      { name: "Isha", time: "7:32 PM", minutes: 1172, icon: Moon },
    ];

    // Determine current prayer window
    let activeIdx = -1;
    for (let i = schedule.length - 1; i >= 0; i--) {
      if (currentMinutes >= schedule[i].minutes) {
        activeIdx = i;
        break;
      }
    }
    if (activeIdx === -1) {
      activeIdx = 4; // Before Fajr is night (Isha)
    }

    return schedule.map((p, idx) => {
      let status: "passed" | "now" | "upcoming" = "upcoming";
      if (idx === activeIdx) {
        status = "now";
      } else if (idx < activeIdx) {
        status = "passed";
      }
      return {
        name: p.name,
        time: p.time,
        status,
        icon: p.icon,
      };
    });
  }, []);

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-2xl p-5 h-auto lg:h-78.5 box-border shadow-[0_2px_10px_rgba(16,60,48,0.05)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-foreground tracking-tight m-0">
            Prayer Times
          </h2>
          <div className="text-xs text-[#5E766E] dark:text-muted-foreground mt-1 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#0B5F49] dark:text-emerald-400" />
            <span>{mosqueName}</span>
          </div>
        </div>
        <span className="h-6.5 px-4 rounded-lg bg-[#DDF1E9] dark:bg-emerald-950/70 text-[#0B6B52] dark:text-emerald-300 text-xs font-semibold flex items-center justify-center">
          Today
        </span>
      </div>

      {/* 5-Column Prayer Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-3.5">
        {prayers.map((prayer) => {
          const Icon = prayer.icon;
          const isNow = prayer.status === "now";
          const isPassed = prayer.status === "passed";

          return (
            <div
              key={prayer.name}
              className={`pt flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[13px] text-[#2F4A42] dark:text-emerald-100 transition-all ${
                isNow
                  ? "bg-[#DDF1E9] dark:bg-emerald-950/80 border border-emerald-500/30 font-semibold shadow-xs"
                  : "bg-[#F4F8F6] dark:bg-muted/40 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 ${
                  isNow
                    ? "text-[#0B8A63] dark:text-emerald-400"
                    : "text-[#5E766E] dark:text-muted-foreground"
                }`}
              />
              <span className="text-xs font-medium">{prayer.name}</span>
              <b className="text-[14px] text-[#12332B] dark:text-white font-bold">
                {prayer.time}
              </b>

              {isNow ? (
                <span className="text-[10px] font-semibold text-[#0B8A63] dark:text-emerald-400">
                  + Now
                </span>
              ) : isPassed ? (
                <span className="text-[10px] font-medium text-[#0B8A63] dark:text-emerald-400">
                  ✓ Passed
                </span>
              ) : (
                <span className="text-[10px] text-[#5E766E] dark:text-muted-foreground font-medium">
                  Upcoming
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Quranic Verse Banner */}
      <div className="mt-2.5 h-24.5 rounded-xl bg-linear-to-r from-[#CFE7DD] via-[#E6F3EE] to-[#D4EADF] dark:from-[#0d2a23] dark:via-[#13362e] dark:to-[#0f2d26] border border-[#DCEBE5] dark:border-border/50 text-center pt-2.5 px-3 box-border overflow-hidden relative flex flex-col justify-center">
        <div
          dir="rtl"
          className="text-lg sm:text-[19px] font-bold text-[#0B3F32] dark:text-emerald-200 leading-tight"
          style={{ fontFamily: "'Noto Naskh Arabic', serif, system-ui" }}
        >
          وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
        </div>
        <div className="text-[10px] text-[#2F5A4D] dark:text-emerald-300/90 mt-1 leading-snug">
          And I did not create the jinn and mankind except that they may worship Me.
          <br />
          <span className="font-semibold opacity-90">— Quran 51:56</span>
        </div>
      </div>
    </div>
  );
}

