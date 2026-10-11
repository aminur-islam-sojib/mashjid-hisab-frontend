"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMosque } from "@/providers/mosque-provider";
import { useAuth } from "@/providers/auth-provider";
import { isRouteAllowed, getRoleHome } from "@/lib/roles";

interface MosqueRouteGuardProps {
  children: React.ReactNode;
}

function RouteGuardFallback() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-muted rounded-xl" />
        <div className="h-28 bg-muted rounded-xl" />
        <div className="h-28 bg-muted rounded-xl" />
      </div>
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  );
}

export function MosqueRouteGuard({ children }: MosqueRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, activeMosque } = useMosque();
  const { user, isLoading: isAuthLoading } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Parse path: /mosques/:mosqueId/:segment
  const segments = React.useMemo(() => {
    return pathname ? pathname.split("/").filter(Boolean) : [];
  }, [pathname]);

  const mosqueId = segments[1] || activeMosque?.id || "";
  const currentSegment = segments[2] || "";

  const isAllowed = React.useMemo(() => {
    if (isAuthLoading) return null; // Pending
    if (isSuperAdmin) return true;
    if (!activeRole) return false;

    // Direct visit to /mosques/:mosqueId with no sub-path is not a page; must redirect to home
    if (!currentSegment) return false;

    return isRouteAllowed(currentSegment, activeRole, false);
  }, [isAuthLoading, isSuperAdmin, activeRole, currentSegment]);

  // Handle redirect before render when forbidden or visiting bare mosque root
  React.useEffect(() => {
    if (isAuthLoading) return;
    if (isAllowed === false && mosqueId) {
      const targetHome = getRoleHome(mosqueId, activeRole);
      // Avoid looping if targetHome matches current path
      if (pathname !== targetHome) {
        router.replace(targetHome);
      }
    }
  }, [isAuthLoading, isAllowed, mosqueId, activeRole, pathname, router]);

  // If loading or unauthorized, do NOT render children (prevents 403 API calls)
  if (isAuthLoading || isAllowed === false || isAllowed === null) {
    return <RouteGuardFallback />;
  }

  return <>{children}</>;
}

