"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
  ChevronDown,
  User,
  SlidersHorizontal,
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
}

interface NavSection {
  title?: string;
  items: NavItem[];
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

  // Auto-expand setup accordion if on a setup page
  const isSetupRouteActive = React.useMemo(() => {
    return ["/accounts", "/funds", "/categories", "/settings"].some((path) =>
      pathname?.startsWith(`${base}${path}`)
    );
  }, [pathname, base]);

  const [isSetupOpen, setIsSetupOpen] = React.useState(isSetupRouteActive);

  React.useEffect(() => {
    if (isSetupRouteActive) {
      setIsSetupOpen(true);
    }
  }, [isSetupRouteActive]);

  // Primary navigation grouped into 5 core areas
  const sections: NavSection[] = React.useMemo(
    () => [
      {
        // Top Level: Home & Approvals
        items: [
          {
            title: "Dashboard",
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
        ],
      },
      {
        title: "Daily Work",
        items: [
          {
            title: "Donations",
            href: `${base}/donations`,
            icon: Coins,
            allowedRoles: ROUTE_PERMISSIONS["donations"],
          },
          {
            title: "Expenses",
            href: `${base}/expenses`,
            icon: TrendingDown,
            allowedRoles: ROUTE_PERMISSIONS["expenses"],
          },
          {
            title: "Transfers",
            href: `${base}/transfers`,
            icon: ArrowLeftRight,
            allowedRoles: ROUTE_PERMISSIONS["transfers"],
          },
          {
            title: "Box Counting",
            href: `${base}/collections`,
            icon: Receipt,
            allowedRoles: ROUTE_PERMISSIONS["collections"],
          },
        ],
      },
      {
        title: "People",
        items: [
          {
            title: "Members",
            href: `${base}/members`,
            icon: Users,
            allowedRoles: ROUTE_PERMISSIONS["members"],
          },
          {
            title: "Families",
            href: `${base}/families`,
            icon: Home,
            allowedRoles: ROUTE_PERMISSIONS["families"],
          },
          {
            title: "Chanda & Dues",
            href: `${base}/chanda`,
            icon: CalendarHeart,
            allowedRoles: ROUTE_PERMISSIONS["chanda"],
          },
          {
            title: "Pledges",
            href: `${base}/pledges`,
            icon: HeartHandshake,
            allowedRoles: ROUTE_PERMISSIONS["pledges"],
          },
          {
            title: "Campaigns",
            href: `${base}/campaigns`,
            icon: CheckSquare,
            allowedRoles: ROUTE_PERMISSIONS["campaigns"],
          },
        ],
      },
      {
        title: "Records",
        items: [
          {
            title: "Master Ledger",
            href: `${base}/transactions`,
            icon: History,
            allowedRoles: ROUTE_PERMISSIONS["transactions"],
          },
          {
            title: "Reports",
            href: `${base}/reports`,
            icon: FileText,
            allowedRoles: ROUTE_PERMISSIONS["reports"],
          },
          {
            title: "Audit Logs",
            href: `${base}/audit-logs`,
            icon: ShieldCheck,
            allowedRoles: ROUTE_PERMISSIONS["audit-logs"],
          },
        ],
      },
    ],
    [base, pendingCount]
  );

  // Setup Items (Collapsible Accordion)
  const setupItems: NavItem[] = React.useMemo(
    () => [
      {
        title: "Accounts",
        href: `${base}/accounts`,
        icon: Landmark,
        allowedRoles: ROUTE_PERMISSIONS["accounts"],
      },
      {
        title: "Funds",
        href: `${base}/funds`,
        icon: PiggyBank,
        allowedRoles: ROUTE_PERMISSIONS["funds"],
      },
      {
        title: "Categories",
        href: `${base}/categories`,
        icon: Tags,
        allowedRoles: ROUTE_PERMISSIONS["categories"],
      },
      {
        title: "Settings",
        href: `${base}/settings`,
        icon: Settings,
        allowedRoles: ROUTE_PERMISSIONS["settings"],
      },
    ],
    [base]
  );

  // Portal Item (Accessible to everyone)
  const portalItem: NavItem = React.useMemo(
    () => ({
      title: "My Giving Portal",
      href: `${base}/me`,
      icon: User,
      allowedRoles: ROUTE_PERMISSIONS["me"],
    }),
    [base]
  );

  const visibleSetupItems = setupItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return canAccess(item.allowedRoles);
  });

  const isPortalVisible = !portalItem.allowedRoles || canAccess(portalItem.allowedRoles);

  return (
    <aside
      className={cn(
        "w-64 bg-card border-r border-border h-screen flex flex-col justify-between select-none relative overflow-hidden",
        className
      )}
    >
      {/* Brand Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href={homeHref} className="inline-block transition-transform hover:scale-[1.01]">
          <MosqueLogo size="md" />
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-none">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter((item) => {
            if (!item.allowedRoles) return true;
            return canAccess(item.allowedRoles);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title || `sec-${idx}`} className="space-y-1">
              {section.title && (
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {section.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all group text-left",
                      isActive
                        ? "bg-secondary text-primary font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {Boolean(item.badge && item.badge > 0) && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs shrink-0 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {/* Collapsible SETUP Section */}
        {visibleSetupItems.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => setIsSetupOpen((prev) => !prev)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors",
                isSetupRouteActive
                  ? "text-primary bg-secondary/50 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>Setup</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isSetupOpen && "rotate-180"
                )}
              />
            </button>

            {isSetupOpen && (
              <div className="pl-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {visibleSetupItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium transition-all group text-left",
                        isActive
                          ? "bg-secondary text-primary font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5 transition-colors shrink-0",
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
            )}
          </div>
        )}

        {/* My Giving Portal Item */}
        {isPortalVisible && (
          <div className="pt-2 border-t border-border/40">
            {(() => {
              const Icon = portalItem.icon;
              const isActive =
                pathname === portalItem.href || pathname?.startsWith(`${portalItem.href}/`);
              return (
                <Link
                  href={portalItem.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all group text-left",
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
                  <span className="truncate">{portalItem.title}</span>
                </Link>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Area: Minaret Art & Location Card */}
      <div className="p-4 relative border-t border-border/40">
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
