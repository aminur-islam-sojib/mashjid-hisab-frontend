"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useMosque } from "@/providers/mosque-provider";

interface WelcomeBannerProps {
  name?: string;
  mosqueName?: string;
}

export function WelcomeBanner({ name, mosqueName }: WelcomeBannerProps) {
  const { user } = useAuth();
  const { activeMosque } = useMosque();

  const displayName = name || user?.name || "Respected Brother/Sister";
  const currentMosque = mosqueName || activeMosque?.name || "Mosque Workspace";

  const todayStr = React.useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#cfe7df] dark:border-[#1d4039] bg-gradient-to-r from-[#e8f6f2] via-[#dff2ed] to-[#d3ede5] dark:from-[#0a241f] dark:via-[#0d2a23] dark:to-[#12362f] p-6 lg:p-8 shadow-xs">
      {/* Decorative Islamic Architectural Mosque Silhouette SVG on the right */}
      <div
        className="absolute right-0 bottom-0 top-0 w-full max-w-md pointer-events-none opacity-40 dark:opacity-20 flex items-end justify-end overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 450 180"
          fill="currentColor"
          className="w-full h-full text-primary scale-105 origin-bottom-right"
        >
          {/* Main Dome */}
          <path d="M 280 180 C 280 100 320 85 340 70 C 360 85 400 100 400 180 Z" opacity="0.35" />
          <path d="M 338 55 C 338 50 342 50 342 55 L 342 70 L 338 70 Z" opacity="0.5" />
          {/* Secondary Dome */}
          <path d="M 210 180 C 210 120 235 110 250 95 C 265 110 290 120 290 180 Z" opacity="0.25" />
          {/* Third Dome */}
          <path d="M 140 180 C 140 135 160 125 175 115 C 190 125 210 135 210 180 Z" opacity="0.2" />

          {/* Tall Minaret 1 */}
          <rect x="385" y="60" width="18" height="120" opacity="0.5" rx="1" />
          <path d="M 383 60 L 405 60 L 394 25 Z" opacity="0.6" />
          <path d="M 393 12 C 393 8 395 8 395 12 L 395 25 L 393 25 Z" opacity="0.8" />
          <circle cx="394" cy="8" r="3.5" opacity="0.8" />

          {/* Minaret 2 */}
          <rect x="180" y="80" width="14" height="100" opacity="0.3" rx="1" />
          <path d="M 178 80 L 196 80 L 187 45 Z" opacity="0.4" />
          <circle cx="187" cy="40" r="3" opacity="0.5" />

          {/* Architectural Arch cutouts */}
          <path d="M 330 180 C 330 150 350 150 350 180 Z" fill="white" opacity="0.2" />
          <path d="M 240 180 C 240 155 260 155 260 180 Z" fill="white" opacity="0.2" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs sm:text-sm font-medium text-[#006B5B] dark:text-[#39b89e] tracking-wide">
            Assalamu Alaikum,
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-foreground mt-0.5 tracking-tight">
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md">
            Managing <span className="font-semibold text-foreground">{currentMosque}</span>. May Allah accept your service to the community.
          </p>
          <div className="w-10 h-1 bg-primary rounded-full mt-3.5" />
        </div>

        {/* Date Context Badge */}
        <div className="inline-flex items-center gap-3 bg-card/85 dark:bg-card/70 border border-[#cfe7df]/80 dark:border-border/80 px-4 py-2.5 rounded-xl shadow-xs backdrop-blur-xs self-start md:self-auto">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground tracking-tight">
              Community Calendar
            </span>
            <span className="text-[11px] text-muted-foreground">
              {todayStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
