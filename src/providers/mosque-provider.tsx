"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { setActiveMosqueId } from "@/lib/api-client";
import { MosqueBasic, UserMembership } from "@/types/auth";
import { Role } from "@/types/api";

interface MosqueContextType {
  activeMosque: MosqueBasic | null;
  activeMembership: UserMembership | null;
  activeRole: Role | null;
  switchMosque: (mosqueId: string) => void;
  canAccess: (allowedRoles: readonly Role[]) => boolean;
}

const MosqueContext = React.createContext<MosqueContextType | undefined>(undefined);

export function MosqueProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { memberships, user } = useAuth();

  // Mosque ID from URL param takes precedence
  const urlMosqueId = typeof params?.["mosqueId"] === "string" ? params["mosqueId"] : null;

  const activeMembership = React.useMemo(() => {
    if (!memberships || memberships.length === 0) return null;

    if (urlMosqueId) {
      return (
        memberships.find(
          (m) =>
            m.mosqueId === urlMosqueId ||
            m.mosque?.id === urlMosqueId ||
            m.mosque?.slug === urlMosqueId
        ) ?? null
      );
    }

    // Default to first active membership if no param
    return memberships[0] ?? null;
  }, [memberships, urlMosqueId]);

  const activeMosque = activeMembership?.mosque ?? null;
  const activeRole = activeMembership?.role ?? null;

  // Sync with api-client header injection
  React.useEffect(() => {
    if (activeMembership?.mosqueId) {
      setActiveMosqueId(activeMembership.mosqueId);
    } else {
      setActiveMosqueId(null);
    }
  }, [activeMembership]);

  const switchMosque = React.useCallback(
    (mosqueId: string) => {
      setActiveMosqueId(mosqueId);
      router.push(`/mosques/${mosqueId}/dashboard`);
    },
    [router]
  );

  const canAccess = React.useCallback(
    (allowedRoles: readonly Role[]): boolean => {
      // Super admin can access everything
      if (user?.role === "SUPER_ADMIN") return true;
      if (!activeRole) return false;
      return allowedRoles.includes(activeRole);
    },
    [activeRole, user?.role]
  );

  return (
    <MosqueContext.Provider
      value={{
        activeMosque,
        activeMembership,
        activeRole,
        switchMosque,
        canAccess,
      }}
    >
      {children}
    </MosqueContext.Provider>
  );
}

export function useMosque() {
  const context = React.useContext(MosqueContext);
  if (!context) {
    throw new Error("useMosque must be used within a MosqueProvider");
  }
  return context;
}

