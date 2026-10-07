"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LogIn, ArrowRight, Loader2 } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { loginSchema, LoginFormData } from "../validation";
import { ApiError } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const result = await login(data.identifier, data.password);
      toast.success("Welcome back!", {
        description: `Logged in as ${result.user.name}`,
      });

      if (result.user.mustChangePassword) {
        router.push("/change-password");
        return;
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (result.activeMosqueId) {
        router.push(`/mosques/${result.activeMosqueId}/dashboard`);
      } else {
        router.push("/mosques");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            if (issue.field === "identifier" || issue.field === "password") {
              setError(issue.field, { message: issue.issue });
            }
          });
        } else {
          toast.error("Authentication failed", {
            description: err.message,
          });
        }
      } else {
        toast.error("Login Error", {
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
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-4">
            <MosqueLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Sign In to Mosque Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter your email or phone number to access your account.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Email or Phone Number
            </label>
            <Input
              {...register("identifier")}
              type="text"
              autoComplete="username"
              placeholder="e.g. imam@mosque.org or +8801712345678"
              disabled={isSubmitting}
            />
            {errors.identifier && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.password.message}
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Bottom register link */}
        <div className="mt-6 pt-6 border-t border-border/80 text-center">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

