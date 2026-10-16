"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

function TransactionsRedirectContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mosqueId = params?.["mosqueId"] as string;

  React.useEffect(() => {
    if (mosqueId) {
      if (searchParams?.get("tab") === "pending") {
        router.replace(`/mosques/${mosqueId}/approvals`);
      } else {
        router.replace(`/mosques/${mosqueId}/money?tab=transactions`);
      }
    }
  }, [mosqueId, router, searchParams]);

  return (
    <div className="py-16 text-center text-xs text-muted-foreground">
      Redirecting...
    </div>
  );
}

export default function TransactionsRedirect() {
  return (
    <React.Suspense
      fallback={
        <div className="py-16 text-center text-xs text-muted-foreground">
          Redirecting...
        </div>
      }
    >
      <TransactionsRedirectContent />
    </React.Suspense>
  );
}

