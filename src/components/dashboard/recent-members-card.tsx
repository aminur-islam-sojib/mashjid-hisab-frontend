"use client";

import * as React from "react";
import { ArrowUpRight, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  joined: string;
  status: "Active" | "Pending" | "Inactive";
}

const defaultMembers: MemberItem[] = [
  {
    id: "1",
    name: "Abdullah Rahman",
    email: "abdullah@gmail.com",
    joined: "Jan 12, 2025",
    status: "Active",
  },
  {
    id: "2",
    name: "Fatima Akter",
    email: "fatima@gmail.com",
    joined: "Jan 10, 2025",
    status: "Active",
  },
  {
    id: "3",
    name: "Mohammad Hasan",
    email: "hasan@gmail.com",
    joined: "Jan 8, 2025",
    status: "Active",
  },
];

export function RecentMembersCard({ members = defaultMembers }: { members?: MemberItem[] }) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="text-base sm:text-lg font-semibold font-heading text-foreground">
          Recent Members
        </h3>
        <a
          href="#members"
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-0.5 hover:underline"
        >
          View all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Table Header */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-muted-foreground uppercase border-b border-border/40">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium hidden sm:table-cell">Joined</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right sr-only">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {members.map((member) => (
              <tr key={member.id} className="group hover:bg-muted/40 transition-colors">
                {/* Member Info & Avatar */}
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-secondary dark:bg-[#123b33] border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Joined Date */}
                <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                  {member.joined}
                </td>

                {/* Status Badge */}
                <td className="py-3 px-2">
                  <Badge variant="success" className="text-[10px] font-medium px-2 py-0.5">
                    {member.status}
                  </Badge>
                </td>

                {/* Menu */}
                <td className="py-3 pl-2 text-right relative">
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === member.id ? null : member.id)
                    }
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Member options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenu === member.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded-xl shadow-lg py-1 z-30 text-xs text-left">
                      <button className="w-full px-3 py-1.5 hover:bg-muted text-foreground transition-colors">
                        View Profile
                      </button>
                      <button className="w-full px-3 py-1.5 hover:bg-muted text-foreground transition-colors">
                        Edit Member
                      </button>
                      <button className="w-full px-3 py-1.5 hover:bg-destructive/10 text-destructive transition-colors">
                        Deactivate
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

