import * as React from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign In — Mosque Management",
};

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}

