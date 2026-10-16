"use client";

import * as React from "react";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  joinedAt?: string;
  joined?: string;
  status: string;
  role?: string;
  color?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const AVATAR_COLORS = ["#6B4F3A", "#9A6A5C", "#4F6B5F", "#0B6B52", "#3E7BD6"];

export function RecentMembersCard({
  members = [],
  mosqueId,
}: {
  members?: MemberItem[];
  mosqueId?: string;
}) {
  const displayList = members.slice(0, 4);

  return (
    <div className="cd bg-card border border-[#E4ECE9] dark:border-border rounded-2xl p-4 sm:p-4.5 box-border shadow-[0_2px_10px_rgba(16,60,48,0.05)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-[13px] font-bold text-foreground tracking-tight m-0">
          Recent Members
        </h2>
        <Link
          href={mosqueId ? `/mosques/${mosqueId}/people` : "#"}
          className="text-[11px] text-[#5E766E] dark:text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          View all →
        </Link>
      </div>

      {/* Table Rows or Empty State */}
      <div className="mt-2.5 flex-1 flex flex-col justify-center">
        {displayList.length > 0 ? (
          <div>
            {/* Table Head */}
            <div className="grid grid-cols-[1.5fr_1fr_0.8fr_20px] items-center py-2 text-[11px] font-semibold text-[#5E766E] dark:text-muted-foreground">
              <span>Name</span>
              <span>Joined</span>
              <span>Status</span>
              <span />
            </div>

            {/* Member Items */}
            {displayList.map((m, idx) => {
              const initials = getInitials(m.name);
              const avatarBg = m.color || AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const joinedFormatted = m.joined
                ? m.joined
                : m.joinedAt
                ? new Date(m.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              const isActive = m.status?.toUpperCase() === "ACTIVE";

              return (
                <div
                  key={m.id || idx}
                  className="grid grid-cols-[1.5fr_1fr_0.8fr_20px] items-center py-2.5 border-t border-[#EDF2F0] dark:border-border/60 text-[11px] text-[#5E766E] dark:text-muted-foreground"
                >
                  {/* Name & Avatar */}
                  <div className="flex items-center min-w-0 pr-1">
                    <span
                      className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white mr-3 shrink-0"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </span>
                    <span className="text-[#12332B] dark:text-foreground font-semibold leading-tight truncate">
                      {m.name}
                      <span className="block font-normal text-[10px] text-[#5E766E] dark:text-muted-foreground truncate">
                        {m.email || m.role?.toLowerCase() || "Member"}
                      </span>
                    </span>
                  </div>

                  {/* Joined Date */}
                  <span className="whitespace-nowrap">{joinedFormatted}</span>

                  {/* Status Badge */}
                  <span
                    className={`rounded-[6px] px-2.5 py-0.5 text-[10px] font-semibold justify-self-start ${
                      isActive
                        ? "bg-[#DDF1E9] dark:bg-emerald-950/70 text-[#0B8A63] dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.status || "Active"}
                  </span>

                  {/* Action Menu */}
                  <Link
                    href={mosqueId ? `/mosques/${mosqueId}/people` : "#"}
                    className="text-[#5E766E] dark:text-muted-foreground hover:text-primary transition-colors text-center font-bold"
                  >
                    ⋮
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="w-9 h-9 rounded-full bg-[#E1F2EB] dark:bg-emerald-950/60 text-[#0B6B52] dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-foreground">No members yet</p>
            <p className="text-[10px] text-muted-foreground">Add community members to track pledges and giving.</p>
            {mosqueId && (
              <Link href={`/mosques/${mosqueId}/people`}>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-1">
                  <UserPlus className="w-3 h-3" />
                  Add Member
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
