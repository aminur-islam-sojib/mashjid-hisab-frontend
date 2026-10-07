"use client";

import * as React from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChartPoint {
  date: string;
  amount: number;
}

const dataByPeriod: Record<string, { total: string; trend: string; points: ChartPoint[] }> = {
  "This Month": {
    total: "$8,450",
    trend: "+18%",
    points: [
      { date: "Oct 1", amount: 650 },
      { date: "Oct 5", amount: 1200 },
      { date: "Oct 8", amount: 1100 },
      { date: "Oct 12", amount: 1850 },
      { date: "Oct 15", amount: 1600 },
      { date: "Oct 18", amount: 2400 },
      { date: "Oct 22", amount: 2100 },
      { date: "Oct 26", amount: 2650 },
      { date: "Oct 31", amount: 2950 },
    ],
  },
  "Last Month": {
    total: "$7,160",
    trend: "+9%",
    points: [
      { date: "Sep 1", amount: 450 },
      { date: "Sep 5", amount: 900 },
      { date: "Sep 8", amount: 1300 },
      { date: "Sep 12", amount: 1400 },
      { date: "Sep 15", amount: 1750 },
      { date: "Sep 18", amount: 1900 },
      { date: "Sep 22", amount: 2000 },
      { date: "Sep 26", amount: 2300 },
      { date: "Sep 30", amount: 2450 },
    ],
  },
  "This Year": {
    total: "$89,320",
    trend: "+24%",
    points: [
      { date: "Jan", amount: 1200 },
      { date: "Mar", amount: 1600 },
      { date: "May", amount: 2800 },
      { date: "Jul", amount: 2200 },
      { date: "Sep", amount: 2400 },
      { date: "Oct", amount: 2950 },
    ],
  },
};

export function DonationsChartCard() {
  const [period, setPeriod] = React.useState<"This Month" | "Last Month" | "This Year">("This Month");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [hoveredPoint, setHoveredPoint] = React.useState<ChartPoint | null>(null);

  const currentData = dataByPeriod[period];
  const maxAmount = 3000;
  const width = 500;
  const height = 160;
  const paddingX = 20;
  const paddingY = 20;

  // Generate SVG smooth curve path
  const points = currentData.points.map((p, idx) => {
    const x =
      paddingX +
      (idx / (currentData.points.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      (p.amount / maxAmount) * (height - paddingY * 2);
    return { x, y, data: p };
  });

  // Catmull-Rom or smooth cubic bezier curve
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between">
      {/* Header & Period Dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground">
            Monthly Donations
          </h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-secondary/80 hover:bg-secondary rounded-lg border border-border/80 transition-colors"
          >
            {period}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-card border border-border rounded-xl shadow-md py-1 z-20 text-xs">
              {(["This Month", "Last Month", "This Year"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setPeriod(opt);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-muted text-foreground transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Value & Comparison */}
      <div className="mt-3">
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
            {currentData.total}
          </span>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            {currentData.trend}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Compared to last month
        </p>
      </div>

      {/* Responsive Smooth SVG Line / Area Chart */}
      <div className="relative mt-4 w-full h-44">
        {/* Y-axis Labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[11px] text-muted-foreground font-mono select-none pointer-events-none pb-6">
          <span>$3k</span>
          <span>$2k</span>
          <span>$1k</span>
          <span>$0</span>
        </div>

        {/* SVG Drawing */}
        <div className="pl-7 w-full h-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E9F86" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0E9F86" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 1, 2, 3].map((idx) => {
              const y = paddingY + (idx / 3) * (height - paddingY * 2);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#donationGradient)" />

            {/* Smooth Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#008F78"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Last active point marker */}
            {lastPoint && (
              <g>
                <circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r="5"
                  fill="#006B5B"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r="8"
                  fill="#008F78"
                  opacity="0.25"
                />
              </g>
            )}

            {/* Interactive hover points */}
            {points.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="7"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>
        </div>

        {/* X-axis Date Labels */}
        <div className="pl-7 flex items-center justify-between text-[11px] text-muted-foreground select-none mt-1">
          {currentData.points
            .filter((_, idx, arr) => idx === 0 || idx === Math.floor(arr.length / 2) || idx === arr.length - 1)
            .map((p) => (
              <span key={p.date}>{p.date}</span>
            ))}
        </div>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-1 right-2 bg-foreground text-background text-[11px] px-2 py-1 rounded shadow-md pointer-events-none">
            {hoveredPoint.date}: ${hoveredPoint.amount}
          </div>
        )}
      </div>
    </Card>
  );
}

