"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { changePasswordSchema, ChangePasswordFormData } from "../validation";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

export function ChangePasswordForm() {
  const router = useRouter();
  const { user, refetchSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.patch("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password changed successfully!", {
        description: "Your permanent password has been updated.",
      });

      await refetchSession();
      router.push("/mosques");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof ChangePasswordFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Password update failed", {
            description: err.message,
          });
        }
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
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="mb-4">
            <MosqueLogo size="lg" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Requirement
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Change Your Password
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
            {user?.mustChangePassword
              ? "Your account was provisioned with a temporary password. You must set a permanent password before continuing."
              : "Update your account password to maintain security."}
          </p>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Current / Temporary Password
            </label>
            <Input
              {...register("currentPassword")}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              New Password
            </label>
            <Input
              {...register("newPassword")}
              type="password"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              disabled={isSubmitting}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.newPassword.message}
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
                Updating password...
              </>
            ) : (
              <>
                Update Password
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

