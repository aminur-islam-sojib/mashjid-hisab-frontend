"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fundSchema, FundFormData } from "../validation";
import { FundItem } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface FundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  initialData?: FundItem | null;
  onSuccess: () => void;
}

export function FundDialog({
  isOpen,
  onClose,
  mosqueId,
  initialData,
  onSuccess,
}: FundDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FundFormData>({
    resolver: zodResolver(fundSchema) as any,
    defaultValues: {
      name: "",
      type: "GENERAL",
      isRestricted: false,
      description: "",
      confirmPolicyChange: false,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        isRestricted: initialData.isRestricted,
        description: initialData.description || "",
        confirmPolicyChange: false,
      });
    } else {
      reset({
        name: "",
        type: "GENERAL",
        isRestricted: false,
        description: "",
        confirmPolicyChange: false,
      });
    }
  }, [initialData, reset, isOpen]);

  const onSubmit = async (data: FundFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiClient.patch(`/mosques/${mosqueId}/funds/${initialData.id}`, {
          name: data.name,
          description: data.description ? data.description : null,
          isRestricted: data.isRestricted,
          confirmPolicyChange: data.confirmPolicyChange,
        });
        toast.success("Fund updated successfully");
      } else {
        await apiClient.post(`/mosques/${mosqueId}/funds`, {
          name: data.name,
          type: data.type,
          isRestricted: data.isRestricted,
          description: data.description ? data.description : undefined,
        });
        toast.success("Fund created successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof FundFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Operation failed", {
            description: err.message,
          });
        }
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Fund" : "Create New Fund"}
      description="Accounting fund for organizing collections and restricted allocations."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Fund Name <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Zakat Fund or Mosque Expansion"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Fund Category Type
          </label>
          <select
            {...register("type")}
            disabled={isEditing || isSubmitting}
            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
          >
            <option value="GENERAL">General (Unrestricted)</option>
            <option value="ZAKAT">Zakat (Strictly Restricted)</option>
            <option value="SADAQAH">Sadaqah</option>
            <option value="CONSTRUCTION">Construction / Expansion</option>
            <option value="MADRASA">Madrasa / Education</option>
            <option value="QURBANI">Qurbani</option>
            <option value="WAQF">Waqf</option>
            <option value="IFTAR">Iftar / Ramadan</option>
            <option value="OTHER">Other Purpose</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/80">
          <input
            {...register("isRestricted")}
            type="checkbox"
            id="isRestricted"
            className="w-4 h-4 rounded text-primary focus:ring-primary/30"
            disabled={isSubmitting}
          />
          <label htmlFor="isRestricted" className="text-xs font-medium text-foreground cursor-pointer">
            Restricted Fund (Money cannot be spent on general operational expenses)
          </label>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
            <input
              {...register("confirmPolicyChange")}
              type="checkbox"
              id="confirmPolicyChange"
              className="w-4 h-4 rounded text-amber-600"
              disabled={isSubmitting}
            />
            <label htmlFor="confirmPolicyChange" className="text-[11px] font-medium cursor-pointer">
              Confirm restriction policy change if modifying existing fund balance rules
            </label>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Description / Purpose (Optional)
          </label>
          <Input
            {...register("description")}
            placeholder="Detailed purpose of this fund"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.description.message}</p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Fund"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
