"use client";

import { useParams } from "next/navigation";
import { ReportsPage } from "@/features/reports/reports-page";

export default function Page() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;

  return <ReportsPage mosqueId={mosqueId} />;
}
