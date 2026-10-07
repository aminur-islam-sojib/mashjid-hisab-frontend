"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../validation";
import { apiClient } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: data.email });
      setIsSent(true);
      toast.success("Reset link dispatched", {
        description: "If an account exists, instructions have been sent.",
      });
    } catch {
      // Backend returns generic success to avoid account enumeration
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="p-8 shadow-md border-border bg-card">
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="mb-4">
            <MosqueLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter your registered email to receive a password reset link.
          </p>
        </div>

        {isSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Instructions Sent
            </p>
            <p className="text-xs text-muted-foreground">
              If an account is associated with this email, you will receive password reset instructions shortly.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Registered Email
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="imam@mosque.org"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 mt-2 font-semibold text-sm gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

