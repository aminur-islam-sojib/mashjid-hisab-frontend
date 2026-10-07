import * as React from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Reset Password — Mosque Management",
};

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

