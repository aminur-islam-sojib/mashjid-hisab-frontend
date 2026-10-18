"use client";

import { useParams } from "next/navigation";
import { ApprovalsView } from "@/features/approvals/approvals-view";

export default function ApprovalsPage() {
  const params = useParams();
  const mosqueId = params?.["mosqueId"] as string;

  return <ApprovalsView mosqueId={mosqueId} />;
}
