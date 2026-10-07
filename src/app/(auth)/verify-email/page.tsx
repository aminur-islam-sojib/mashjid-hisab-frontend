"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided.");
      return;
    }

    apiClient
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message || "Failed to verify email address.");
      });
  }, [token]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="p-8 shadow-md border-border bg-card text-center">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="mb-4">
            <MosqueLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Email Verification
          </h1>
        </div>

        {status === "loading" && (
          <div className="py-8 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Verifying your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-foreground">
              Email Verified Successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              Your email is confirmed. You can now access all features.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="w-full">Continue to Sign In</Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-foreground">
              Verification Failed
            </p>
            <p className="text-xs text-muted-foreground">
              {errorMessage || "The verification link may have expired or is invalid."}
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

