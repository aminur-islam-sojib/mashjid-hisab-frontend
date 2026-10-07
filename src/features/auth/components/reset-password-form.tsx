"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { resetPasswordSchema, ResetPasswordFormData } from "../validation";
import { apiClient, ApiError } from "@/lib/api-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token: data.token,
        password: data.password,
      });

      toast.success("Password reset successful!", {
        description: "You may now sign in with your new password.",
      });

      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Password reset failed", {
          description: err.message,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
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
            Set New Password
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter and confirm your new secure password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("token")} value={token} />

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              New Password
            </label>
            <Input
              {...register("password")}
              type="password"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Confirm New Password
            </label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Re-enter your new password"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.confirmPassword.message}
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
                Resetting password...
              </>
            ) : (
              <>
                Save Password
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

