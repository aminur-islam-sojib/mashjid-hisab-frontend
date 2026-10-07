"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categorySchema, CategoryFormData } from "../validation";
import { CategoryItem } from "../types";
import { FundItem } from "@/features/funds/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  funds?: FundItem[];
  initialData?: CategoryItem | null;
  defaultType?: "INCOME" | "EXPENSE";
  onSuccess: () => void;
}

export function CategoryDialog({
  isOpen,
  onClose,
  mosqueId,
  funds,
  initialData,
  defaultType = "INCOME",
  onSuccess,
}: CategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: defaultType,
      fundId: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        fundId: initialData.fundId || "",
      });
    } else {
      reset({
        name: "",
        type: defaultType,
        fundId: "",
      });
    }
  }, [initialData, defaultType, reset, isOpen]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiClient.patch(`/mosques/${mosqueId}/categories/${initialData.id}`, {
          name: data.name,
          fundId: data.fundId ? data.fundId : null,
        });
        toast.success("Category updated successfully");
      } else {
        await apiClient.post(`/mosques/${mosqueId}/categories`, {
          name: data.name,
          type: data.type,
          fundId: data.fundId ? data.fundId : undefined,
        });
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof CategoryFormData;
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
      title={isEditing ? "Edit Category" : "Add Category"}
      description="Taxonomy for labeling income collections and expenditure vouchers."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category Name <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Utility Bills, Imam Salary, Jummah Box, or Book Sales"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category Type
          </label>
          <select
            {...register("type")}
            disabled={isEditing || isSubmitting}
            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
          >
            <option value="INCOME">Income / Revenue Category</option>
            <option value="EXPENSE">Expense / Disbursement Category</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Restrict to Specific Fund (Optional)
          </label>
          <select
            {...register("fundId")}
            disabled={isSubmitting}
            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
          >
            <option value="">Any Fund (Available across all funds)</option>
            {funds?.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name} ({fund.type})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">
            If selected, this category will only be allowed when recording transactions for this fund.
          </p>
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
              "Add Category"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

