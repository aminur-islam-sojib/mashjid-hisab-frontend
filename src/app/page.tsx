"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

export default function RootHomePage() {
  const router = useRouter();
  const { user, activeMosqueId, isLoading, mustChangePassword } = useAuth();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (mustChangePassword) {
        router.push("/change-password");
      } else if (activeMosqueId) {
        router.push(`/mosques/${activeMosqueId}/dashboard`);
      } else {
        router.push("/mosques");
      }
    }
  }, [user, activeMosqueId, isLoading, mustChangePassword, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground font-medium">Entering Mosque Management...</p>
    </div>
  );
}
