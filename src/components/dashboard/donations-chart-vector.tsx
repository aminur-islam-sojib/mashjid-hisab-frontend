"use client";

import * as React from "react";
import { formatCompactCurrency, formatCurrency } from "@/lib/money";

export interface DonationDataPoint {
  day: number;
  label: string;
  date: string;
  amount: string | bigint; // poisha
  formattedAmount?: string;
}

export interface ChartCoord {
  x: number;
  y: number;
  label: string;
  date?: string;
  amount?: bigint;
  formattedAmount?: string;
}

export interface ChartYLabel {
  text: string;
  y: number;
}

export interface ChartGeometry {
  coords: ChartCoord[];
  strokePath: string;
  fillPath: string;
  lastCoord: { x: number; y: number };
  yLabels: ChartYLabel[];
}

export interface DonationsChartVectorProps {
  points?: DonationDataPoint[];
  chartGeometry?: ChartGeometry;
}

export function DonationsChartVector({ points, chartGeometry }: DonationsChartVectorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>(500);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const initialW = Math.round(containerRef.current.clientWidth);
    if (initialW > 0) {
      setWidth(initialW);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width);
        if (w > 0) {
          setWidth(w);
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const height = 150;
  const yTop = 16;
  const yBaseline = 120;
  const xStart = 38;
  const xEnd = Math.max(xStart + 60, width - 8);

  const geometry = React.useMemo(() => {
    if (points && points.length > 0) {
      const amounts = points.map((p) => {
        try {
          return BigInt(p.amount?.toString() || "0");
        } catch {
          return 0n;
        }
      });
      const maxVal = amounts.reduce((max, val) => (val > max ? val : max), 0n);
      const effectiveMax = maxVal > 0n ? maxVal : 100000n; // fallback scale ৳1,000

      const coords: ChartCoord[] = points.map((p, idx) => {
        const x = points.length === 1
          ? (xStart + xEnd) / 2
          : xStart + (idx / (points.length - 1)) * (xEnd - xStart);
        const val = amounts[idx];
        const ratio = Number(val) / Number(effectiveMax);
        const y = yBaseline - ratio * (yBaseline - yTop);
        return {
          x,
          y,
          label: p.label,
          date: p.date,
          amount: val,
          formattedAmount: p.formattedAmount || formatCurrency(val, { showDecimals: false }),
        };
      });

      let strokePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const curr = coords[i];
        const next = coords[i + 1];
        const mx = (curr.x + next.x) / 2;
        strokePath += ` C ${mx.toFixed(1)} ${curr.y.toFixed(1)}, ${mx.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
      }

      const fillPath = `${strokePath} L ${coords[coords.length - 1].x.toFixed(1)} ${yBaseline} L ${coords[0].x.toFixed(1)} ${yBaseline} Z`;

      const gridSteps = [
        { text: formatCompactCurrency(effectiveMax), y: yTop },
        { text: formatCompactCurrency((effectiveMax * 2n) / 3n), y: yTop + (yBaseline - yTop) * (1 / 3) },
        { text: formatCompactCurrency(effectiveMax / 3n), y: yTop + (yBaseline - yTop) * (2 / 3) },
        { text: "৳0", y: yBaseline },
      ];

      return {
        coords,
        strokePath,
        fillPath,
        lastCoord: coords[coords.length - 1],
        gridSteps,
      };
    }

    // Fallback if only chartGeometry is provided
    if (chartGeometry) {
      return {
        coords: chartGeometry.coords.map((c) => ({
          ...c,
          date: "",
          amount: 0n,
          formattedAmount: "",
        })),
        strokePath: chartGeometry.strokePath,
        fillPath: chartGeometry.fillPath,
        lastCoord: chartGeometry.lastCoord,
        gridSteps: chartGeometry.yLabels.map((lbl) => ({ text: lbl.text, y: lbl.y })),
      };
    }

    return null;
  }, [points, chartGeometry, width, xStart, xEnd, yTop, yBaseline]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!geometry || !geometry.coords.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < geometry.coords.length; i++) {
      const dist = Math.abs(geometry.coords[i].x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }
    setHoveredIdx(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoveredIdx(null);
  };

  const activeCoord = geometry
    ? (hoveredIdx !== null ? geometry.coords[hoveredIdx] : null)
    : null;
  const lastCoord = geometry ? geometry.lastCoord : null;

  // Tooltip positioning
  const tooltipWidth = 78;
  const tooltipHeight = 32;
  const halfTooltip = tooltipWidth / 2;
  const tooltipX = activeCoord
    ? Math.max(xStart - 4 + halfTooltip, Math.min(width - halfTooltip - 2, activeCoord.x))
    : 0;
  const tooltipY = activeCoord
    ? (activeCoord.y - tooltipHeight - 8 < 2 ? activeCoord.y + 10 : activeCoord.y - tooltipHeight - 8)
    : 0;

  return (
    <div
      ref={containerRef}
      className="w-full mt-2 flex-1 flex flex-col justify-end relative select-none"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[150px] overflow-visible block"
        role="img"
        aria-label="Monthly donations trend"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          <linearGradient id="donationsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B8A63" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#0B8A63" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Transparent hit-test rect for smooth pointer tracking across the full width */}
        <rect x="0" y="0" width={width} height={height} fill="transparent" />

        {geometry && (
          <>
            {/* Horizontal Grid lines */}
            <g stroke="#EAF1EE" strokeWidth="1" className="dark:stroke-border/40">
              {geometry.gridSteps.map((step, idx) => (
                <line
                  key={`line-${idx}`}
                  x1={xStart - 4}
                  x2={width}
                  y1={step.y}
                  y2={step.y}
                />
              ))}
            </g>

            {/* Y-Axis Value Labels (aligned to left margin at x=0, vertically centered to grid lines) */}
            <g fontSize="9" fill="#5E766E" className="font-sans dark:fill-muted-foreground select-none">
              {geometry.gridSteps.map((step, idx) => (
                <text
                  key={`ylabel-${idx}`}
                  x="0"
                  y={step.y}
                  dominantBaseline="middle"
                >
                  {step.text}
                </text>
              ))}

              {/* X-Axis Milestone Date Labels */}
              {geometry.coords.map((c, idx) => {
                let anchor: "start" | "middle" | "end" = "middle";
                let posX = c.x;
                if (idx === 0) {
                  anchor = "start";
                  posX = xStart - 2;
                } else if (idx === geometry.coords.length - 1) {
                  anchor = "end";
                  posX = xEnd;
                }
                const isHovered = hoveredIdx === idx;
                return (
                  <text
                    key={`xlabel-${c.label}-${idx}`}
                    x={posX}
                    y="140"
                    textAnchor={anchor}
                    fill={isHovered ? "#0B8A63" : "#5E766E"}
                    className={`text-[9px] font-sans transition-colors duration-150 ${
                      isHovered ? "font-bold dark:fill-emerald-400" : "dark:fill-muted-foreground"
                    }`}
                  >
                    {c.label}
                  </text>
                );
              })}
            </g>

            {/* Area Fill */}
            <path d={geometry.fillPath} fill="url(#donationsGradient)" />

            {/* Area Stroke */}
            <path
              d={geometry.strokePath}
              fill="none"
              stroke="#0B8A63"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Default Active Dot on latest milestone (when not hovering) */}
            {!activeCoord && lastCoord && (
              <g>
                <circle
                  cx={lastCoord.x}
                  cy={lastCoord.y}
                  r="7"
                  fill="#0B8A63"
                  fillOpacity="0.2"
                />
                <circle
                  cx={lastCoord.x}
                  cy={lastCoord.y}
                  r="4"
                  fill="#0B8A63"
                />
              </g>
            )}

            {/* Active Hover Guideline, Dot, and Tooltip */}
            {activeCoord && (
              <g className="pointer-events-none">
                {/* Vertical Crosshair Line */}
                <line
                  x1={activeCoord.x}
                  y1={yTop}
                  x2={activeCoord.x}
                  y2={yBaseline}
                  stroke="#0B8A63"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                />

                {/* Highlighted Dot with Ring */}
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r="9"
                  fill="#0B8A63"
                  fillOpacity="0.2"
                />
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r="4.5"
                  fill="#0B8A63"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="dark:stroke-card"
                />

                {/* Floating Tooltip Pill */}
                <g className="transition-all duration-100 ease-out select-none">
                  <rect
                    x={tooltipX - halfTooltip}
                    y={tooltipY}
                    width={tooltipWidth}
                    height={tooltipHeight}
                    rx="6"
                    fill="#0A2E24"
                    className="shadow-lg dark:fill-card dark:stroke dark:stroke-border"
                  />
                  <text
                    x={tooltipX}
                    y={tooltipY + 12}
                    textAnchor="middle"
                    fill="#A7F3D0"
                    fontSize="9"
                    fontWeight="500"
                    className="font-sans dark:fill-emerald-400"
                  >
                    {activeCoord.label}
                  </text>
                  <text
                    x={tooltipX}
                    y={tooltipY + 24}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="700"
                    className="font-sans dark:fill-foreground"
                  >
                    {activeCoord.formattedAmount}
                  </text>
                </g>
              </g>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

export default DonationsChartVector;
