"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

export default function MembersRedirect() {
  const params = useParams();
  const router = useRouter();
  const mosqueId = params?.["mosqueId"] as string;

  React.useEffect(() => {
    if (mosqueId) {
      router.replace(`/mosques/${mosqueId}/people?tab=members`);
    }
  }, [mosqueId, router]);

  return (
    <div className="py-16 text-center text-xs text-muted-foreground">
      Redirecting to Members...
    </div>
  );
}
