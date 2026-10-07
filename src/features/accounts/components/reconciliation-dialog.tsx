"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reconciliationSchema, ReconciliationFormData } from "../validation";
import { AccountItem } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";
import { majorToPoisha, formatCurrency } from "@/lib/money";
import { Loader2, Scale } from "lucide-react";

interface ReconciliationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  account: AccountItem | null;
  onSuccess: () => void;
}

export function ReconciliationDialog({
  isOpen,
  onClose,
  mosqueId,
  account,
  onSuccess,
}: ReconciliationDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: {
      realBalanceMajor: "",
      notes: "",
      fundId: "",
    },
  });

  React.useEffect(() => {
    reset({
      realBalanceMajor: "",
      notes: "",
      fundId: "",
    });
  }, [isOpen, reset]);

  if (!account) return null;

  const onSubmit = async (data: ReconciliationFormData) => {
    setIsSubmitting(true);
    try {
      const realBalancePoisha = majorToPoisha(data.realBalanceMajor);

      await apiClient.post(`/mosques/${mosqueId}/accounts/${account.id}/reconciliations`, {
        realBalance: realBalancePoisha,
        notes: data.notes ? data.notes : undefined,
        fundId: data.fundId ? data.fundId : undefined,
      });

      toast.success("Account reconciliation completed!", {
        description: "Adjustment entry was recorded for any balance variance.",
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Reconciliation failed", {
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
      title={`Reconcile ${account.name}`}
      description="Compare system balance against actual verified physical/bank balance."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Current System Ledger Balance:</span>
          <span className="font-bold font-heading text-foreground">
            {formatCurrency(account.currentBalance ?? account.openingBalance)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Actual Real Balance (৳ BDT) <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("realBalanceMajor")}
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 25000.00"
            disabled={isSubmitting}
          />
          {errors.realBalanceMajor && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.realBalanceMajor.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Audit Reconciliation Notes (Optional)
          </label>
          <Input
            {...register("notes")}
            placeholder="e.g. Monthly physical audit verified by treasurer"
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="gap-1.5" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Reconciling...
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" />
                Confirm Reconciliation
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

