import * as React from "react";
import { MosquePicker } from "@/features/mosques/components/mosque-picker";

export const metadata = {
  title: "Select Mosque Workspace — Mosque Management",
};

export default function MosquesPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background relative overflow-hidden">
      <MosquePicker />
    </div>
  );
}

