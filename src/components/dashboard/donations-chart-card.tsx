"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/money";
import { DonationsChartVector, type DonationDataPoint } from "./donations-chart-vector";

export type { DonationDataPoint };

export interface DonationsChartCardProps {
  monthlyIncome?: string | bigint;
  lastMonthIncome?: string | bigint;
  currentMonthLabel?: string;
  lastMonthLabel?: string;
  trendPercentage?: number;
  lastMonthTrendPercentage?: number;
  currentMonthPoints?: DonationDataPoint[];
  lastMonthPoints?: DonationDataPoint[];
  dataPoints?: DonationDataPoint[];
}

export function DonationsChartCard({
  monthlyIncome = "0",
  lastMonthIncome = "0",
  currentMonthLabel,
  lastMonthLabel,
  trendPercentage = 0,
  lastMonthTrendPercentage = 0,
  currentMonthPoints = [],
  lastMonthPoints = [],
  dataPoints = [],
}: DonationsChartCardProps) {
  const [period, setPeriod] = React.useState<"This Month" | "Last Month">("This Month");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentAmount = period === "This Month" ? monthlyIncome : lastMonthIncome;
  const currentTrend = period === "This Month" ? trendPercentage : lastMonthTrendPercentage;
  const comparisonText = period === "This Month"
    ? `Compared to ${lastMonthLabel ? `last month (${lastMonthLabel})` : "previous period"}`
    : "Compared to month prior";

  const formattedAmount = React.useMemo(() => {
    return formatCurrency(currentAmount || "0", { showDecimals: false });
  }, [currentAmount]);

  const activePoints = React.useMemo(() => {
    if (period === "This Month") {
      if (currentMonthPoints && currentMonthPoints.length >= 2) return currentMonthPoints;
      if (dataPoints && dataPoints.length >= 2) return dataPoints;
    } else {
      if (lastMonthPoints && lastMonthPoints.length >= 2) return lastMonthPoints;
    }

    const prefix = period === "This Month" ? (currentMonthLabel || "Day") : (lastMonthLabel || "Day");
    return [
      { day: 1, label: `${prefix} 1`, date: "", amount: "0" },
      { day: 8, label: `${prefix} 8`, date: "", amount: "0" },
      { day: 15, label: `${prefix} 15`, date: "", amount: "0" },
      { day: 22, label: `${prefix} 22`, date: "", amount: "0" },
      { day: 30, label: `${prefix} 30`, date: "", amount: "0" },
    ];
  }, [period, currentMonthPoints, lastMonthPoints, dataPoints, currentMonthLabel, lastMonthLabel]);

  const renderTrend = (pct: number) => {
    if (pct > 0) {
      return (
        <span className="text-[12px] font-semibold text-[#0B8A63] align-middle font-sans">
          ▲ +{pct}%
        </span>
      );
    }
    if (pct < 0) {
      return (
        <span className="text-[12px] font-semibold text-rose-600 align-middle font-sans">
          ▼ {pct}%
        </span>
      );
    }
    return (
      <span className="text-[12px] font-medium text-[#5E766E] dark:text-muted-foreground align-middle font-sans">
        — 0%
      </span>
    );
  };

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-[14px] p-5 h-auto lg:h-78.5 box-border shadow-[0_2px_10px_rgba(16,60,48,0.05)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground tracking-tight m-0">
          Monthly Donations
        </h2>

        {/* Period Selector */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="border border-[#DCE7E3] dark:border-border rounded-[7px] px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{period}</span>
            <span className="text-[10px] text-[#5E766E] dark:text-muted-foreground">⌄</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-28 bg-card border border-border rounded-lg shadow-lg py-1 z-30 text-xs">
              {(["This Month", "Last Month"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeriod(p);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-muted font-medium transition-colors cursor-pointer ${
                    period === p ? "text-primary font-bold bg-muted/40" : "text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Metric */}
      <div className="mt-2.5">
        <div className="text-[26px] font-bold text-foreground leading-tight font-sans tabular-nums">
          {formattedAmount}{" "}
          {renderTrend(currentTrend)}
        </div>
        <div className="text-xs text-[#5E766E] dark:text-muted-foreground mt-1 font-medium">
          {comparisonText}
        </div>
      </div>

      {/* Fully Responsive & Dynamic Area Chart Canvas */}
      <DonationsChartVector points={activePoints} />
    </div>
  );
}

export default DonationsChartCard;

