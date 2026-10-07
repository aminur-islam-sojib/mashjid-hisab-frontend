"use client";

import * as React from "react";
import {
  UserPlus,
  HeartHandshake,
  CalendarPlus,
  Users2,
  Building,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAddMember: () => void;
  onRecordDonation: () => void;
  onScheduleEvent: () => void;
  onActionToast?: (title: string) => void;
}

export function QuickActionsCard({
  onAddMember,
  onRecordDonation,
  onScheduleEvent,
  onActionToast,
}: QuickActionsProps) {
  const actions = [
    {
      title: "Add Member",
      icon: UserPlus,
      onClick: onAddMember,
    },
    {
      title: "Record Donation",
      icon: HeartHandshake,
      onClick: onRecordDonation,
    },
    {
      title: "Schedule Event",
      icon: CalendarPlus,
      onClick: onScheduleEvent,
    },
    {
      title: "Add Staff",
      icon: Users2,
      onClick: () => onActionToast?.("Staff recruitment modal opened"),
    },
    {
      title: "Manage Facility",
      icon: Building,
      onClick: () => onActionToast?.("Navigating to Facility reservation manager"),
    },
    {
      title: "Generate Report",
      icon: FileSpreadsheet,
      onClick: () => onActionToast?.("Compiling Monthly Financial & Attendance PDF Report"),
    },
  ];

  return (
    <Card className="overflow-hidden p-0 border-border">
      {/* Dark Teal Header with Islamic Arch Motif */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#004f45] to-[#003932] dark:from-[#08201b] dark:to-[#041411] text-white p-5 sm:p-6 pb-6">
        {/* Subtle geometric Islamic arch watermark */}
        <div
          className="absolute right-0 top-0 bottom-0 w-32 opacity-15 pointer-events-none flex items-center justify-end"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M 10 120 L 10 50 C 10 20 50 10 50 10 C 50 10 90 20 90 50 L 90 120" />
            <path d="M 25 120 L 25 55 C 25 35 50 25 50 25 C 50 25 75 35 75 55 L 75 120" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
            {/* Mihrab / Mosque symbol */}
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 22h16" />
              <path d="M6 22V10a6 6 0 0 1 12 0v12" />
              <path d="M12 4v4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-white tracking-tight">
              Quick Actions
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Manage your mosque activities
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid of 6 Action Buttons */}
      <div className="p-4 sm:p-5 bg-card">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={act.onClick}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 transition-all text-center group cursor-pointer",
                  "bg-muted/30 hover:bg-secondary/70 hover:border-primary/40 hover:shadow-xs active:scale-[0.98]"
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-card text-primary flex items-center justify-center shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground transition-all mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {act.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

