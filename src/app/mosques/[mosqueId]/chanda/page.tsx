"use client";

import { useParams } from "next/navigation";
import { ChandaPage } from "@/features/chanda/chanda-page";

export default function Page() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;

  return <ChandaPage mosqueId={mosqueId} />;
}
