"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import {
  rejectTransactionSchema,
  type RejectTransactionValues,
} from "./validation";
import { UnifiedTransactionItem } from "./types";

interface RejectTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  transaction: UnifiedTransactionItem | null;
}

export function RejectTransactionDialog({
  isOpen,
  onClose,
  mosqueId,
  transaction,
}: RejectTransactionDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectTransactionValues>({
    resolver: zodResolver(rejectTransactionSchema),
    defaultValues: {
      reason: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ reason: "" });
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: RejectTransactionValues) => {
      if (!transaction) return;
      return apiClient.post(
        `/mosques/${mosqueId}/transactions/${transaction.id}/reject`,
        values
      );
    },
    onSuccess: () => {
      toast.success("Transaction rejected.");
      queryClient.invalidateQueries({ queryKey: ["transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["pending-transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reject transaction");
    },
  });

  const onSubmit = (values: RejectTransactionValues) => {
    mutation.mutate(values);
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Transaction">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Confirm Rejection</p>
            <p className="text-red-700 text-xs mt-1">
              Rejecting this transaction ({transaction.type} of{" "}
              {formatCurrency(transaction.amount)}) will discard it from posting to
              mosque balances. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="Explain why this transaction is being rejected..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] focus:border-transparent resize-none"
          />
          {errors.reason && (
            <p className="text-xs text-red-600">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject Transaction"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

