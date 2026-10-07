"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { apiClient, setUnauthorizedHandler } from "@/lib/api-client";
import { AuthMeData, LoginResponseData, PublicUser, UserMembership } from "@/types/auth";
import { Role } from "@/types/api";

interface AuthContextType {
  user: PublicUser | null;
  memberships: UserMembership[];
  activeMosqueId: string | null;
  role: Role | null;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (identifier: string, password: string) => Promise<LoginResponseData>;
  logout: () => Promise<void>;
  refetchSession: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = React.useState<PublicUser | null>(null);
  const [memberships, setMemberships] = React.useState<UserMembership[]>([]);
  const [activeMosqueId, setActiveMosqueId] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<Role | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSession = React.useCallback(async () => {
    try {
      const data = await apiClient.get<AuthMeData>("/auth/me");
      setUser(data.user);
      setMemberships(data.memberships || []);
      setActiveMosqueId(data.activeMosqueId);
      setRole(data.role);
    } catch {
      setUser(null);
      setMemberships([]);
      setActiveMosqueId(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setMemberships([]);
      setActiveMosqueId(null);
      setRole(null);
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register")) {
          router.push(`/login?redirect=${encodeURIComponent(path || "/")}`);
        }
      }
    });
  }, [router]);

  const login = async (identifier: string, password: string): Promise<LoginResponseData> => {
    const data = await apiClient.post<LoginResponseData>("/auth/login", {
      identifier,
      password,
    });
    setUser(data.user);
    setActiveMosqueId(data.activeMosqueId);
    setRole(data.role);

    // Refresh full memberships
    await fetchSession();
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setUser(null);
      setMemberships([]);
      setActiveMosqueId(null);
      setRole(null);
      router.push("/login");
    }
  };

  const mustChangePassword = user?.mustChangePassword ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        activeMosqueId,
        role,
        isLoading,
        mustChangePassword,
        login,
        logout,
        refetchSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
