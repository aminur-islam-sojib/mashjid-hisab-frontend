import * as React from "react";
import { CreateMosqueForm } from "@/features/mosques/components/create-mosque-form";

export const metadata = {
  title: "Create Mosque Workspace — Mosque Management",
};

export default function NewMosquePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background relative overflow-hidden">
      <CreateMosqueForm />
    </div>
  );
}

