"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  CheckSquare,
  Coins,
  TrendingDown,
  Users,
  CalendarHeart,
  Landmark,
  FileText,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { useMosque } from "@/providers/mosque-provider";
import { Role } from "@/types/api";
import {
  ROUTE_PERMISSIONS,
  FINANCIAL_OPERATOR_ROLES,
  getRoleHome,
} from "@/lib/roles";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { PendingQueueResult } from "@/features/transactions/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: readonly Role[];
  badge?: number;
  subtitle?: string;
  matchPrefixes?: string[];
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { activeMosque, activeRole, canAccess } = useMosque();
  const mosqueId = activeMosque?.id || "";

  const base = mosqueId ? `/mosques/${mosqueId}` : "/mosques";
  const homeHref = mosqueId ? getRoleHome(mosqueId, activeRole) : "/mosques";

  // Check if current user is an approver to fetch live pending badge
  const isApprover = canAccess(FINANCIAL_OPERATOR_ROLES);
  const { data: pendingData } = useQuery<PendingQueueResult>({
    queryKey: ["pending-transactions", mosqueId],
    queryFn: () =>
      apiClient.get<PendingQueueResult>(
        `/mosques/${mosqueId}/transactions/pending?limit=1`
      ),
    enabled: Boolean(mosqueId) && isApprover,
    refetchInterval: 30000,
  });
  const pendingCount = pendingData?.totalPending || 0;

  // The 8 consolidated items following the UX Complexity Budget
  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        title: "Home",
        href: `${base}/dashboard`,
        icon: LayoutDashboard,
        allowedRoles: ROUTE_PERMISSIONS["dashboard"],
      },
      {
        title: "Approvals",
        href: `${base}/approvals`,
        icon: CheckSquare,
        allowedRoles: ROUTE_PERMISSIONS["approvals"],
        badge: pendingCount,
      },
      {
        title: "Donations",
        href: `${base}/donations`,
        icon: Coins,
        allowedRoles: ROUTE_PERMISSIONS["donations"],
        subtitle: "2 tabs",
        matchPrefixes: [`${base}/donations`, `${base}/collections`],
      },
      {
        title: "Expenses",
        href: `${base}/expenses`,
        icon: TrendingDown,
        allowedRoles: ROUTE_PERMISSIONS["expenses"],
      },
      {
        title: "People",
        href: `${base}/people`,
        icon: Users,
        allowedRoles: ROUTE_PERMISSIONS["members"],
        subtitle: "4 tabs",
        matchPrefixes: [
          `${base}/people`,
          `${base}/members`,
          `${base}/families`,
          `${base}/chanda`,
          `${base}/pledges`,
        ],
      },
      {
        title: "Campaigns",
        href: `${base}/campaigns`,
        icon: CalendarHeart,
        allowedRoles: ROUTE_PERMISSIONS["campaigns"],
      },
      {
        title: "Money",
        href: `${base}/money`,
        icon: Landmark,
        allowedRoles: ROUTE_PERMISSIONS["transactions"],
        subtitle: "4 tabs",
        matchPrefixes: [
          `${base}/money`,
          `${base}/transactions`,
          `${base}/transfers`,
          `${base}/accounts`,
          `${base}/funds`,
        ],
      },
      {
        title: "Reports",
        href: `${base}/reports`,
        icon: FileText,
        allowedRoles: ROUTE_PERMISSIONS["reports"],
      },
    ],
    [base, pendingCount]
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
      <div className="p-5 border-b border-border/50">
        <Link href={homeHref} className="inline-block transition-transform hover:scale-[1.01]">
          <MosqueLogo size="md" />
        </Link>
      </div>

      {/* Navigation Links (8 Items) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-none">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchPrefixes
            ? item.matchPrefixes.some((prefix) => pathname?.startsWith(prefix))
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group text-left",
                isActive
                  ? "bg-secondary text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 transition-colors shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.title}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.subtitle && !isActive && (
                  <span className="text-[10px] text-muted-foreground/60 hidden group-hover:inline">
                    {item.subtitle}
                  </span>
                )}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mosque Workspace Card */}
      <div className="p-3 border-t border-border/40">
        <Link
          href="/mosques"
          title="Click to switch mosque workspace"
          className="relative bg-secondary/70 dark:bg-muted/40 border border-border/80 rounded-xl p-2.5 flex items-center justify-between gap-2 backdrop-blur-xs hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {activeMosque?.name || "Select Mosque"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {activeRole ? activeRole.replace("_", " ") : "Switch mosque"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
