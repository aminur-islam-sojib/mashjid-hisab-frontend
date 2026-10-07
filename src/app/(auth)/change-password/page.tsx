import * as React from "react";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export const metadata = {
  title: "Change Password — Mosque Management",
};

export default function ChangePasswordPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <ChangePasswordForm />
    </React.Suspense>
  );
}

