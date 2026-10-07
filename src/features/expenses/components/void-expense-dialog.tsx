"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voidExpenseSchema, VoidExpenseFormData } from "../validation";
import { ExpenseItem } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { Loader2, AlertTriangle } from "lucide-react";

interface VoidExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  expense: ExpenseItem | null;
  onSuccess: () => void;
}

export function VoidExpenseDialog({
  isOpen,
  onClose,
  mosqueId,
  expense,
  onSuccess,
}: VoidExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoidExpenseFormData>({
    resolver: zodResolver(voidExpenseSchema),
    defaultValues: { reason: "" },
  });

  React.useEffect(() => {
    reset({ reason: "" });
  }, [isOpen, reset]);

  if (!expense) return null;

  const onSubmit = async (data: VoidExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/mosques/${mosqueId}/expenses/${expense.id}/void`, {
        reason: data.reason,
      });

      toast.success("Expense voided successfully", {
        description: "Reversal entry was recorded in the master ledger.",
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to void expense", {
          description: err.message,
        });
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
      title="Void Posted Expense"
      description="Financial ledger entries cannot be deleted. Voiding generates an audited reversal entry."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-xs text-destructive leading-relaxed">
            Voiding will reverse voucher <strong>{expense.voucherNo || expense.id}</strong> ({formatCurrency(expense.amount)}) paid to <strong>{expense.payee}</strong> and restore funds to the account.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Audit Reason for Voiding <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("reason")}
            placeholder="e.g. Duplicate voucher or cancelled invoice"
            disabled={isSubmitting}
          />
          {errors.reason && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.reason.message}</p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Processing...
              </>
            ) : (
              "Confirm Void"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

