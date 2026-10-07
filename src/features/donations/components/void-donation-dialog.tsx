"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voidDonationSchema, VoidDonationFormData } from "../validation";
import { DonationItem } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { Loader2, AlertTriangle } from "lucide-react";

interface VoidDonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  donation: DonationItem | null;
  onSuccess: () => void;
}

export function VoidDonationDialog({
  isOpen,
  onClose,
  mosqueId,
  donation,
  onSuccess,
}: VoidDonationDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoidDonationFormData>({
    resolver: zodResolver(voidDonationSchema),
    defaultValues: { reason: "" },
  });

  React.useEffect(() => {
    reset({ reason: "" });
  }, [isOpen, reset]);

  if (!donation) return null;

  const onSubmit = async (data: VoidDonationFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/mosques/${mosqueId}/donations/${donation.id}/void`, {
        reason: data.reason,
      });

      toast.success("Donation voided successfully", {
        description: "Reversal entry was recorded in the master ledger.",
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Failed to void donation", {
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
      title="Void Posted Donation"
      description="Financial ledger entries cannot be deleted. Voiding generates an audited reversal transaction."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-xs text-destructive leading-relaxed">
            Voiding will invalidate Receipt{" "}
            <strong>{donation.receiptNumber || donation.id}</strong> ({formatCurrency(donation.amount)}) and reduce the account balance.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Audit Reason for Voiding <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("reason")}
            placeholder="e.g. Duplicate entry or cheque returned"
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

