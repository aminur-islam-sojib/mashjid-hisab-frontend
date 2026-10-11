"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Coins, TrendingDown, Menu, HeartHandshake, CheckSquare } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";
import { getRoleHome } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  onOpenMore: () => void;
}

export function MobileBottomBar({ onOpenMore }: MobileBottomBarProps) {
  const pathname = usePathname();
  const { activeMosque, activeRole } = useMosque();
  const mosqueId = activeMosque?.id || "";
  const base = mosqueId ? `/mosques/${mosqueId}` : "/mosques";

  const isMember = activeRole === "MEMBER";
  const homeHref = mosqueId ? getRoleHome(mosqueId, activeRole) : "/mosques";

  // For members, quick routes point to Pledges and Campaigns; for staff/operators, to Donations and Expenses
  const secondTab = isMember
    ? {
        title: "Pledges",
        href: `${base}/pledges`,
        icon: HeartHandshake,
      }
    : {
        title: "Donations",
        href: `${base}/donations`,
        icon: Coins,
      };

  const thirdTab = isMember
    ? {
        title: "Campaigns",
        href: `${base}/campaigns`,
        icon: CheckSquare,
      }
    : {
        title: "Expenses",
        href: `${base}/expenses`,
        icon: TrendingDown,
      };

  const isHomeActive = pathname === homeHref;
  const isSecondActive = pathname?.startsWith(secondTab.href);
  const isThirdActive = pathname?.startsWith(thirdTab.href);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-lg px-2 py-1.5 flex items-center justify-around safe-bottom"
    >
      {/* 1. Home */}
      <Link
        href={homeHref}
        className={cn(
          "flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl text-xs font-medium transition-colors",
          isHomeActive
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutDashboard
          className={cn("w-5 h-5 mb-0.5", isHomeActive ? "text-primary" : "text-muted-foreground")}
        />
        <span className="text-[11px] leading-tight">Home</span>
      </Link>

      {/* 2. Donations / Pledges */}
      <Link
        href={secondTab.href}
        className={cn(
          "flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl text-xs font-medium transition-colors",
          isSecondActive
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <secondTab.icon
          className={cn("w-5 h-5 mb-0.5", isSecondActive ? "text-primary" : "text-muted-foreground")}
        />
        <span className="text-[11px] leading-tight">{secondTab.title}</span>
      </Link>

      {/* 3. Expenses / Campaigns */}
      <Link
        href={thirdTab.href}
        className={cn(
          "flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl text-xs font-medium transition-colors",
          isThirdActive
            ? "text-primary font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <thirdTab.icon
          className={cn("w-5 h-5 mb-0.5", isThirdActive ? "text-primary" : "text-muted-foreground")}
        />
        <span className="text-[11px] leading-tight">{thirdTab.title}</span>
      </Link>

      {/* 4. More Drawer */}
      <button
        type="button"
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open full menu"
      >
        <Menu className="w-5 h-5 mb-0.5 text-muted-foreground" />
        <span className="text-[11px] leading-tight">More</span>
      </button>
    </nav>
  );
}

