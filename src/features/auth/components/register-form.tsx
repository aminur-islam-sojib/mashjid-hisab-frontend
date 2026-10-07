"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { registerSchema, RegisterFormData } from "../validation";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

export function RegisterForm() {
  const router = useRouter();
  const { refetchSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      locale: "bn",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone ? data.phone : undefined,
        password: data.password,
        locale: data.locale,
      });

      toast.success("Account created successfully!", {
        description: "Please check your email for verification.",
      });

      await refetchSession();
      router.push("/mosques");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof RegisterFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Registration failed", {
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
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-4">
            <MosqueLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Join Mosque Management platform to administer or contribute.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("name")}
              type="text"
              autoComplete="name"
              placeholder="e.g. Tariq Ahmed"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="tariq@gmail.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Phone Number (Optional)
            </label>
            <Input
              {...register("phone")}
              type="tel"
              autoComplete="tel"
              placeholder="+8801712345678"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
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
                Creating account...
              </>
            ) : (
              <>
                Register
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Bottom sign-in link */}
        <div className="mt-6 pt-6 border-t border-border/80 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
