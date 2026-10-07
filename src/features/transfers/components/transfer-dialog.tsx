"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTransferSchema, CreateTransferFormData } from "../validation";
import { FundItem } from "@/features/funds/types";
import { AccountItem } from "@/features/accounts/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { majorToPoisha } from "@/lib/money";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  funds?: FundItem[];
  accounts?: AccountItem[];
  onSuccess: () => void;
}

export function TransferDialog({
  isOpen,
  onClose,
  mosqueId,
  funds,
  accounts,
  onSuccess,
}: TransferDialogProps) {
  const { canAccess } = useMosque();
  const isAdmin = canAccess(["MOSQUE_ADMIN"]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0]!;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateTransferFormData>({
    resolver: zodResolver(createTransferSchema) as any,
    defaultValues: {
      amountMajor: "",
      fromAccountId: accounts?.[0]?.id || "",
      toAccountId: accounts?.[1]?.id || accounts?.[0]?.id || "",
      fromFundId: funds?.[0]?.id || "",
      toFundId: "",
      date: todayStr,
      isFundTransfer: false,
      reason: "",
      notes: "",
    },
  });

  const isFundTransfer = watch("isFundTransfer");

  React.useEffect(() => {
    if (isOpen) {
      reset({
        amountMajor: "",
        fromAccountId: accounts?.[0]?.id || "",
        toAccountId: accounts?.[1]?.id || accounts?.[0]?.id || "",
        fromFundId: funds?.[0]?.id || "",
        toFundId: "",
        date: todayStr,
        isFundTransfer: false,
        reason: "",
        notes: "",
      });
    }
  }, [isOpen, accounts, funds, reset, todayStr]);

  const onSubmit = async (data: CreateTransferFormData) => {
    setIsSubmitting(true);
    try {
      const amountPoisha = majorToPoisha(data.amountMajor);

      await apiClient.post(`/mosques/${mosqueId}/transfers`, {
        amount: amountPoisha,
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        fromFundId: data.fromFundId,
        toFundId: data.isFundTransfer ? data.toFundId : undefined,
        date: new Date(data.date).toISOString(),
        reason: data.isFundTransfer ? data.reason : undefined,
        notes: data.notes ? data.notes : undefined,
      });

      toast.success("Transfer completed successfully", {
        description: `৳${data.amountMajor} transferred between accounts.`,
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof CreateTransferFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Transfer failed", {
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
      title="Transfer Treasury Funds"
      description="Move money between cash & bank accounts or transfer between funds."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Transfer Mode Toggle */}
        {isAdmin && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/80">
            <input
              {...register("isFundTransfer")}
              type="checkbox"
              id="isFundTransfer"
              className="w-4 h-4 rounded text-primary"
              disabled={isSubmitting}
            />
            <label htmlFor="isFundTransfer" className="text-xs font-semibold text-foreground cursor-pointer">
              Fund-to-Fund Transfer (Move balance from one Fund to another)
            </label>
          </div>
        )}

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Transfer Amount (৳ BDT) <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("amountMajor")}
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 5000.00"
              disabled={isSubmitting}
            />
            {errors.amountMajor && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.amountMajor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Transfer Date <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("date")}
              type="date"
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* From Account -> To Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Source Account (From) <span className="text-destructive">*</span>
            </label>
            <select
              {...register("fromAccountId")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toLowerCase()})
                </option>
              ))}
            </select>
            {errors.fromAccountId && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.fromAccountId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Destination Account (To) <span className="text-destructive">*</span>
            </label>
            <select
              {...register("toAccountId")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toLowerCase()})
                </option>
              ))}
            </select>
            {errors.toAccountId && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.toAccountId.message}</p>
            )}
          </div>
        </div>

        {/* Source Fund & Destination Fund */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {isFundTransfer ? "Source Fund (From)" : "Associated Accounting Fund"} <span className="text-destructive">*</span>
            </label>
            <select
              {...register("fromFundId")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              {funds?.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name}
                </option>
              ))}
            </select>
            {errors.fromFundId && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.fromFundId.message}</p>
            )}
          </div>

          {isFundTransfer && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Destination Fund (To) <span className="text-destructive">*</span>
              </label>
              <select
                {...register("toFundId")}
                disabled={isSubmitting}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
              >
                <option value="">Select Target Fund</option>
                {funds?.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
              {errors.toFundId && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.toFundId.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Reason (mandatory for Fund transfer) */}
        {isFundTransfer && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Audit Reason for Fund Transfer <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("reason")}
              placeholder="e.g. Allocation of general fund surplus to construction"
              disabled={isSubmitting}
            />
            {errors.reason && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.reason.message}</p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Internal Notes (Optional)
          </label>
          <Input
            {...register("notes")}
            placeholder="e.g. Bank deposit slip #892"
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
                Executing transfer...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Transfer Funds
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
