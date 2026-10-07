import * as React from "react";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
  title: "Create Account — Mosque Management",
};

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <RegisterForm />
    </React.Suspense>
  );
}

