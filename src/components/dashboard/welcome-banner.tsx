"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useMosque } from "@/providers/mosque-provider";

interface WelcomeBannerProps {
  name?: string;
  mosqueName?: string;
}

// Approximate calculation for Hijri date display
function getHijriDate(date: Date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter.format(date);
  } catch {
    return "Jumada Al-Awwal 12, 1447";
  }
}

export function WelcomeBanner({ name, mosqueName }: WelcomeBannerProps) {
  const { user } = useAuth();
  const { activeMosque } = useMosque();

  const displayName = name || user?.name || "Imam Ahmed";
  const currentMosque = mosqueName || activeMosque?.name || "Al-Noor Mosque";

  const hijriStr = React.useMemo(() => getHijriDate(new Date()), []);
  const gregorianStr = React.useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <section className="cd relative h-auto min-h-[148px] box-border px-6 sm:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-[#E9F5F0] to-[#DCEEE7] dark:from-[#0a241f] dark:to-[#0f332a] border border-[#DCEBE5] dark:border-border rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(16,60,48,0.05)]">
      {/* Decorative Islamic Architectural Mosque Silhouette SVG */}
      <svg
        viewBox="0 0 300 148"
        width="300"
        height="148"
        className="absolute right-0 bottom-0 pointer-events-none opacity-60 dark:opacity-20 hidden sm:block"
        fill="#9CCDBB"
        aria-hidden="true"
      >
        <path d="M215 148V40h26v108zM222 40l6-34 6 34zM226 6h4v-6h-4z" />
        <path d="M110 148v-28c0-26 22-34 36-34s36 8 36 34v28zM146 86v-10h-1v10z" />
        <path d="M175 148v-22c0-18 14-24 24-24s24 6 24 24v22zM100 148V70h14v78zM100 70l7-26 7 26z" />
      </svg>

      {/* Left side text greeting */}
      <div className="relative z-10">
        <div className="text-base text-[#12332B] dark:text-emerald-100 font-medium">
          Assalamu Alaikum,
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-[30px] leading-tight text-[#12332B] dark:text-white my-1">
          {displayName}
        </h1>
        <div className="text-[13px] text-[#2F5A4D] dark:text-emerald-300">
          May Allah accept your efforts in serving the Ummah.
        </div>
        <div className="w-9 h-0.5 bg-[#0B8A63] mt-3.5 rounded-full" />
      </div>

      {/* Right side dual-date capsule badge */}
      <div className="relative z-10 flex items-center gap-2.5 bg-white/70 dark:bg-card/70 border border-[#DCEBE5] dark:border-border rounded-[22px] px-4 py-2.5 text-[11px] shadow-xs backdrop-blur-xs self-start md:self-auto">
        <Calendar className="w-4 h-4 text-[#0B5F49] dark:text-emerald-400 shrink-0" />
        <div className="leading-tight text-foreground font-medium">
          <span className="block font-semibold">{hijriStr}</span>
          <span className="text-[#5E766E] dark:text-muted-foreground">{gregorianStr}</span>
        </div>
      </div>
    </section>
  );
}
