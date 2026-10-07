"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FacilityItem {
  name: string;
  percentage: number;
  color: string;
}

const facilityList: FacilityItem[] = [
  { name: "Main Prayer Hall", percentage: 78, color: "#006B5B" },
  { name: "Classrooms", percentage: 62, color: "#0E9F86" },
  { name: "Wudu Area", percentage: 45, color: "#2AA88E" },
  { name: "Library", percentage: 32, color: "#63C3AE" },
  { name: "Others", percentage: 18, color: "#B89A5A" },
];

export function FacilityUsageCard() {
  const [period, setPeriod] = React.useState("This Week");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Donut circumference parameters
  const radius = 54;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const overallPercentage = 78;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between">
      {/* Header & Period Dropdown */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground">
          Facility Usage
        </h3>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-foreground bg-secondary/80 hover:bg-secondary rounded-lg border border-border/80 transition-colors"
          >
            {period}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-card border border-border rounded-xl shadow-md py-1 z-20 text-xs">
              {["This Week", "Last Week", "This Month"].map((opt) => (
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

      {/* Main Content: Donut + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mt-4">
        {/* Donut Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/60 dark:text-muted/30"
              fill="transparent"
            />
            {/* Colored Progress Ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#006B5B"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold font-heading text-foreground leading-none">
              {overallPercentage}%
            </span>
            <span className="text-[10px] text-muted-foreground font-medium mt-1">
              Overall Usage
            </span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="w-full flex-1 space-y-2.5">
          {facilityList.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-foreground font-mono">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

