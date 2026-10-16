"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, Archive, Lock } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { isRouteAllowed, getRoleHome } from "@/lib/roles";

interface MosqueRouteGuardProps {
  children?: React.ReactNode;
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

export function MosqueRouteGuard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeRole, activeMosque } = useMosque();
  const { user, memberships, logout, isLoading: isAuthLoading } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Parse path: /mosques/:mosqueId/:segment
  const segments = React.useMemo(() => {
    return pathname ? pathname.split("/").filter(Boolean) : [];
  }, [pathname]);

  const mosqueId = segments[1] || activeMosque?.id || "";
  const currentSegment = segments[2] || "";
  const tab = searchParams?.get("tab");

  const currentMembership = React.useMemo(() => {
    if (!memberships || !mosqueId) return null;
    return (
      memberships.find(
        (m) =>
          m.mosqueId === mosqueId ||
          m.mosque?.id === mosqueId ||
          m.mosque?.slug === mosqueId
      ) ?? null
    );
  }, [memberships, mosqueId]);

  const isAllowed = React.useMemo(() => {
    if (isAuthLoading) return null; // Pending
    if (isSuperAdmin) return true;
    if (currentMembership?.status === "SUSPENDED") return false;
    if (currentMembership?.mosque?.isArchived) return false;
    if (!activeRole) return false;

    // Direct visit to /mosques/:mosqueId with no sub-path is not a page; must redirect to home
    if (!currentSegment) return false;

    // If congregant member is visiting pledges under people
    if (currentSegment === "people" && (tab === "pledges" || activeRole === "MEMBER")) {
      return isRouteAllowed("pledges", activeRole, false);
    }

    return isRouteAllowed(currentSegment, activeRole, false);
  }, [isAuthLoading, isSuperAdmin, currentMembership, activeRole, currentSegment, tab]);

  // Handle redirect before render when forbidden or visiting bare mosque root
  React.useEffect(() => {
    if (isAuthLoading) return;
    if (currentMembership?.status === "SUSPENDED" || currentMembership?.mosque?.isArchived) {
      return; // Handled by inline modal/view
    }
    if (isAllowed === false && mosqueId) {
      const targetHome = getRoleHome(mosqueId, activeRole);
      if (pathname !== targetHome) {
        router.replace(targetHome);
      }
    }
  }, [isAuthLoading, isAllowed, mosqueId, activeRole, pathname, router, currentMembership]);

  if (isAuthLoading) {
    return null;
  }

  // 1. Explicit Suspended Membership Screen
  if (currentMembership?.status === "SUSPENDED") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-card border border-destructive/20 rounded-2xl shadow-lg text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">
              Membership Suspended
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Your membership in <span className="font-semibold text-foreground">{currentMembership.mosque.name}</span> has been suspended by the mosque administrator. If you believe this is in error, please contact your mosque committee.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/mosques")}
              className="text-xs"
            >
              Switch Workspace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Explicit Archived Mosque Screen
  if (currentMembership?.mosque?.isArchived) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-card border border-amber-500/20 rounded-2xl shadow-lg text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Archive className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">
              Mosque Workspace Archived
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              <span className="font-semibold text-foreground">{currentMembership.mosque.name}</span> has been archived. You cannot record or view transactions while it is archived.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/mosques")}
              className="text-xs"
            >
              Switch Workspace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized fallback vs redirect
  if (isAllowed === false) {
    const targetHome = getRoleHome(mosqueId, activeRole);
    if (pathname === targetHome) {
      return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-md text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading text-foreground">
                Access Restricted
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                You do not have permission to access this area of the workspace.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/mosques")}
                className="text-xs"
              >
                Return to Mosque Workspaces
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center">
        <RouteGuardFallback />
      </div>
    );
  }

  return null;
}

