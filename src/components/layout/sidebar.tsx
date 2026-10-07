"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  TrendingDown,
  Coins,
  History,
  CheckSquare,
  Users,
  Home,
  FileText,
  Landmark,
  PiggyBank,
  Tags,
  CalendarHeart,
  HeartHandshake,
  ShieldCheck,
  Settings,
  MapPin,
  ChevronRight,
  User,
} from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { useMosque } from "@/providers/mosque-provider";
import { Role } from "@/types/api";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: readonly Role[];
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { activeMosque, canAccess } = useMosque();
  const mosqueId = activeMosque?.id || "";

  const base = `/mosques/${mosqueId}`;

  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        title: "Dashboard",
        href: `${base}/dashboard`,
        icon: LayoutDashboard,
      },
      {
        title: "Master Ledger",
        href: `${base}/transactions`,
        icon: History,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "Donations",
        href: `${base}/donations`,
        icon: Coins,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER", "STAFF"],
      },
      {
        title: "Expenses",
        href: `${base}/expenses`,
        icon: TrendingDown,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER", "STAFF"],
      },
      {
        title: "Transfers",
        href: `${base}/transfers`,
        icon: ArrowLeftRight,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "Counting Sessions",
        href: `${base}/collections`,
        icon: Receipt,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "STAFF"],
      },
      {
        title: "Chanda & Dues",
        href: `${base}/chanda`,
        icon: CalendarHeart,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "Pledges",
        href: `${base}/pledges`,
        icon: HeartHandshake,
      },
      {
        title: "Campaigns",
        href: `${base}/campaigns`,
        icon: CheckSquare,
      },
      {
        title: "Accounts",
        href: `${base}/accounts`,
        icon: Landmark,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "Funds",
        href: `${base}/funds`,
        icon: PiggyBank,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "Categories",
        href: `${base}/categories`,
        icon: Tags,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER", "STAFF"],
      },
      {
        title: "Members",
        href: `${base}/members`,
        icon: Users,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "Families",
        href: `${base}/families`,
        icon: Home,
      },
      {
        title: "Reports",
        href: `${base}/reports`,
        icon: FileText,
        allowedRoles: ["MOSQUE_ADMIN", "TREASURER", "COMMITTEE_MEMBER"],
      },
      {
        title: "My Giving Portal",
        href: `${base}/me`,
        icon: User,
      },
      {
        title: "Audit Logs",
        href: `${base}/audit-logs`,
        icon: ShieldCheck,
        allowedRoles: ["MOSQUE_ADMIN"],
      },
      {
        title: "Settings",
        href: `${base}/settings`,
        icon: Settings,
        allowedRoles: ["MOSQUE_ADMIN"],
      },
    ],
    [base]
  );

  const visibleItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return canAccess(item.allowedRoles);
  });

  return (
    <aside
      className={cn(
        "w-64 bg-card border-r border-border h-screen flex flex-col justify-between select-none relative overflow-hidden",
        className
      )}
    >
      {/* Brand Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href={base ? `${base}/dashboard` : "/mosques"} className="inline-block transition-transform hover:scale-[1.01]">
          <MosqueLogo size="md" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-none">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group text-left",
                isActive
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Area: Mosque Art & Location Card */}
      <div className="p-4 relative">
        {/* Subtle decorative minaret silhouette background */}
        <div
          className="absolute -bottom-2 -left-2 w-32 h-44 opacity-8 dark:opacity-4 pointer-events-none text-primary"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 160" fill="currentColor" className="w-full h-full">
            <path d="M 50 5 C 46 15 44 25 44 35 L 44 45 L 35 48 L 35 55 L 65 55 L 65 48 L 56 45 L 56 35 C 56 25 54 15 50 5 Z M 48 2 C 48 0 52 0 52 2 C 52 4 48 4 48 2 Z" />
            <rect x="40" y="55" width="20" height="40" rx="1" />
            <rect x="36" y="95" width="28" height="8" rx="2" />
            <rect x="38" y="103" width="24" height="50" rx="1" />
            <path d="M 45 68 C 45 64 55 64 55 68 L 55 80 L 45 80 Z" fill="white" opacity="0.4" />
            <path d="M 46 115 C 46 110 54 110 54 115 L 54 135 L 46 135 Z" fill="white" opacity="0.4" />
          </svg>
        </div>

        {/* Location / Workspace Card — Click to switch */}
        <Link
          href="/mosques"
          title="Click to switch mosque workspace"
          className="relative bg-secondary/80 dark:bg-muted/40 border border-border/80 rounded-2xl p-3 flex items-center justify-between gap-2.5 backdrop-blur-xs hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center text-primary shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {activeMosque?.name || "Select Mosque"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {activeMosque?.address || "Click to switch"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
