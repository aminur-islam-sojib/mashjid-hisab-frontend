"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient, ApiError } from "@/lib/api-client";
import { useIdempotencyKey } from "@/lib/idempotency";
import { formatCurrency, majorToPoisha, poishaToMajor } from "@/lib/money";
import { Loader2 } from "lucide-react";

interface AllocateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  unallocatedPoisha: string;
  onSuccess: () => void;
}

interface AllocateFormData {
  fundId: string;
  amountMajor: string;
}

export function AllocateDialog({
  isOpen,
  onClose,
  mosqueId,
  unallocatedPoisha,
  onSuccess,
}: AllocateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { key: idempotencyKey } = useIdempotencyKey(isOpen);

  const { data: funds = [] } = useQuery({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AllocateFormData>({
    defaultValues: {
      fundId: "",
      amountMajor: poishaToMajor(unallocatedPoisha || "0"),
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      const defaultFund = funds.find((f: any) => f.type === "GENERAL") || funds[0];
      reset({
        fundId: defaultFund?.id || "",
        amountMajor: poishaToMajor(unallocatedPoisha || "0"),
      });
    }
  }, [isOpen, unallocatedPoisha, funds, reset]);

  const onSubmit = async (data: AllocateFormData) => {
    if (!data.fundId) {
      toast.error("Please select a fund.");
      return;
    }

    const amountPoisha = majorToPoisha(data.amountMajor || "0");
    const amountBigInt = BigInt(amountPoisha);
    if (amountBigInt <= 0n) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    if (amountBigInt > BigInt(unallocatedPoisha || "0")) {
      toast.error("Allocation amount cannot exceed the unallocated balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(
        `/mosques/${mosqueId}/funds/allocate-unallocated`,
        {
          fundId: data.fundId,
          amount: amountPoisha,
        },
        { idempotencyKey },
      );
      toast.success("Balance allocated successfully.");
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Allocation failed", { description: err.message });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Allocate Unallocated Money"
      description="Physical account balances exceed assigned funds. Allocate this opening money to an accounting fund to maintain equality."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Total Unallocated Balance: {formatCurrency(unallocatedPoisha || "0")}
          </p>
          <p className="text-muted-foreground mt-0.5">
            You can allocate all or part of this balance to a designated fund.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Target Fund
          </label>
          <select
            {...register("fundId", { required: "Please select a fund" })}
            disabled={isSubmitting || funds.length === 0}
            className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {funds.length === 0 ? (
              <option value="">No funds found</option>
            ) : (
              funds.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type})
                </option>
              ))
            )}
          </select>
          {errors.fundId && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.fundId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Allocation Amount (৳ BDT)
          </label>
          <Input
            {...register("amountMajor", { required: "Amount is required" })}
            type="number"
            step="0.01"
            min="0.01"
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Allocating...
              </>
            ) : (
              "Confirm Allocation"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
