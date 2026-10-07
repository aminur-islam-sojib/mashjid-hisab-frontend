"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createMosqueSchema, CreateMosqueFormData } from "../validation";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { MosqueBasic } from "@/types/auth";

export function CreateMosqueForm() {
  const router = useRouter();
  const { refetchSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateMosqueFormData>({
    resolver: zodResolver(createMosqueSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      timezone: "Asia/Dhaka",
      fiscalYearStart: 1,
    },
  });

  const onSubmit = async (data: CreateMosqueFormData) => {
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<MosqueBasic>("/mosques", {
        name: data.name,
        slug: data.slug ? data.slug : undefined,
        address: data.address ? data.address : undefined,
        timezone: data.timezone,
        fiscalYearStart: data.fiscalYearStart,
      });

      toast.success("Mosque created successfully!", {
        description: `You are now the administrator of ${created.name}`,
      });

      await refetchSession();
      router.push(`/mosques/${created.id}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof CreateMosqueFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Failed to create mosque", {
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
    <div className="w-full max-w-lg mx-auto p-4">
      <Card className="p-8 shadow-md border-border bg-card">
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/mosques" className="mb-4">
            <MosqueLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            Register a New Mosque
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
            Create a tenant workspace to manage accounts, funds, donations, and members.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Mosque Name <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("name")}
              type="text"
              placeholder="e.g. Baitul Mukarram Central Mosque"
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
              URL Identifier / Slug (Optional)
            </label>
            <Input
              {...register("slug")}
              type="text"
              placeholder="e.g. baitul-mukarram"
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Used for public transparency link: <span className="text-primary font-mono font-medium">/m/[slug]</span>
            </p>
            {errors.slug && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Address / Location (Optional)
            </label>
            <Input
              {...register("address")}
              type="text"
              placeholder="e.g. Motijheel, Dhaka, Bangladesh"
              disabled={isSubmitting}
            />
            {errors.address && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Timezone
              </label>
              <select
                {...register("timezone")}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
                disabled={isSubmitting}
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Fiscal Year Start Month
              </label>
              <select
                {...register("fiscalYearStart")}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
                disabled={isSubmitting}
              >
                <option value={1}>January</option>
                <option value={4}>April</option>
                <option value={7}>July</option>
                <option value={10}>October</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 mt-2 font-semibold text-sm gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering mosque...
              </>
            ) : (
              <>
                Create Mosque Workspace
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/mosques"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to mosque list
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
