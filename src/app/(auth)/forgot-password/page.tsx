import * as React from "react";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password — Mosque Management",
};

export default function ForgotPasswordPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <ForgotPasswordForm />
    </React.Suspense>
  );
}

