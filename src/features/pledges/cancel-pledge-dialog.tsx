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
  cancelPledgeSchema,
  type CancelPledgeValues,
} from "./validation";
import { PledgeRecord } from "./types";

interface CancelPledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  pledge: PledgeRecord | null;
}

export function CancelPledgeDialog({
  isOpen,
  onClose,
  mosqueId,
  pledge,
}: CancelPledgeDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelPledgeValues>({
    resolver: zodResolver(cancelPledgeSchema),
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
    mutationFn: async (values: CancelPledgeValues) => {
      if (!pledge) return;
      return apiClient.post(
        `/mosques/${mosqueId}/pledges/${pledge.id}/cancel`,
        values.reason ? { reason: values.reason } : {}
      );
    },
    onSuccess: () => {
      toast.success("Pledge cancelled.");
      queryClient.invalidateQueries({ queryKey: ["pledges", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel pledge");
    },
  });

  const onSubmit = (values: CancelPledgeValues) => {
    mutation.mutate(values);
  };

  if (!pledge) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Donor Pledge">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Cancel Outstanding Balance</p>
            <p className="text-red-700 text-xs mt-1">
              Cancelling this pledge will close its open commitment balance. Any previously
              received donations attached to this pledge remain safely recorded in the ledger.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Cancellation Reason (Optional)
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="e.g. Donor relocated or requested cancellation..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
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
            Go Back
          </Button>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

