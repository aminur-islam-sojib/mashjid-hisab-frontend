"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionsCardProps {
  mosqueId?: string;
  onAddMember?: () => void;
  onRecordDonation?: () => void;
  onScheduleEvent?: () => void;
  onActionToast?: (title: string) => void;
}

export function QuickActionsCard({
  mosqueId,
  onAddMember,
  onRecordDonation,
  onScheduleEvent,
  onActionToast,
}: QuickActionsCardProps) {
  const actions = [
    {
      title: "Add Member",
      icon: (
        <svg
          className="w-[22px] h-[22px] fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20a6 6 0 0112 0M18 8v6M15 11h6" />
        </svg>
      ),
      href: mosqueId ? `/mosques/${mosqueId}/people` : "#",
      onClick: onAddMember,
    },
    {
      title: "Record Donation",
      icon: (
        <svg
          className="w-[22px] h-[22px] fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M12 20s-7-5-7-9a4 4 0 017-2 4 4 0 017 2c0 4-7 9-7 9z" />
        </svg>
      ),
      href: mosqueId ? `/mosques/${mosqueId}/donations` : "#",
      onClick: onRecordDonation,
    },
    {
      title: "Schedule Event",
      icon: (
        <svg
          className="w-[22px] h-[22px] fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15l2 2 4-4" />
        </svg>
      ),
      href: mosqueId ? `/mosques/${mosqueId}/campaigns` : "#",
      onClick: onScheduleEvent,
    },
    {
      title: "Add Staff",
      icon: (
        <svg
          className="w-[22px] h-[22px] fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0114 0z" />
        </svg>
      ),
      href: mosqueId ? `/mosques/${mosqueId}/people?role=STAFF` : "#",
      onClick: () => onActionToast?.("Staff recruitment management"),
    },
    {
      title: "Manage Facility",
      icon: (
        <svg
          className="w-[22px] h-[22px] fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 8l9-5 9 5v1H3zM5 9v10M19 9v10M10 9v10M14 9v10M3 20h18" />
        </svg>
      ),
      href: mosqueId ? `/mosques/${mosqueId}/accounts` : "#",
      onClick: () => onActionToast?.("Mosque facility management"),
    },
    {
      title: "Generate Report",
      icon: (
        <svg
          className="w-[22px] h-[22px] fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" />
        </svg>
      ),
      href: mosqueId ? `/mosques/${mosqueId}/reports` : "#",
      onClick: () => onActionToast?.("Compiling Financial Report"),
    },
  ];

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-2xl shadow-[0_2px_10px_rgba(16,60,48,0.05)] overflow-hidden">
      {/* Dark Teal Gradient Header with Islamic Arch Watermark */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A5C47] to-[#0E7A5C] text-white p-[22px_20px_24px] flex items-center gap-3.5">
        {/* Arch Watermark */}
        <div
          className="absolute right-0 top-0 bottom-0 w-28 opacity-15 pointer-events-none flex items-center justify-end"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M 10 120 L 10 50 C 10 20 50 10 50 10 C 50 10 90 20 90 50 L 90 120" />
            <path d="M 25 120 L 25 55 C 25 35 50 25 50 25 C 50 25 75 35 75 55 L 75 120" opacity="0.6" />
          </svg>
        </div>

        {/* Mosque Icon */}
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <svg
            className="w-8 h-8 text-white fill-none stroke-current"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M5 21v-9a7 7 0 0114 0v9M12 2v3M9 21v-5h6v5" />
          </svg>
        </div>

        {/* Header Text */}
        <div className="relative z-10">
          <div className="font-serif text-[18px] font-semibold leading-tight text-white">
            Quick Actions
          </div>
          <div className="text-[11px] text-[#CDE8DF] mt-1 font-normal">
            Manage your mosque activities
          </div>
        </div>
      </div>

      {/* 2-Column Grid of 6 Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-2.5 p-[18px_20px_20px] bg-card">
        {actions.map((act) => {
          const itemClasses = cn(
            "qa h-20 rounded-xl bg-[#F2F8F5] dark:bg-emerald-950/40 text-[#12332B] dark:text-emerald-100",
            "flex flex-col items-center justify-center gap-2.5 text-xs font-medium cursor-pointer",
            "border border-transparent hover:border-[#D0E5DC] dark:hover:border-emerald-800",
            "hover:bg-[#E1F2EB] dark:hover:bg-emerald-900/60 hover:text-[#0B5F49] dark:hover:text-emerald-300",
            "transition-all active:scale-[0.98]"
          );

          if (act.onClick && !act.href) {
            return (
              <button
                key={act.title}
                type="button"
                onClick={act.onClick}
                className={itemClasses}
              >
                {act.icon}
                <span>{act.title}</span>
              </button>
            );
          }

          return (
            <Link
              key={act.title}
              href={act.href}
              onClick={act.onClick}
              className={itemClasses}
            >
              {act.icon}
              <span>{act.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
