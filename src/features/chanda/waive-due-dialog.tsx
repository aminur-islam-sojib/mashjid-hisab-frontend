"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { waiveDueSchema, type WaiveDueValues } from "./validation";
import { DueRecord } from "./types";

interface WaiveDueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  due: DueRecord | null;
}

export function WaiveDueDialog({
  isOpen,
  onClose,
  mosqueId,
  due,
}: WaiveDueDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaiveDueValues>({
    resolver: zodResolver(waiveDueSchema),
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
    mutationFn: async (values: WaiveDueValues) => {
      if (!due) return;
      return apiClient.post(`/mosques/${mosqueId}/dues/${due.id}/waive`, values);
    },
    onSuccess: () => {
      toast.success("Due balance waived successfully.");
      queryClient.invalidateQueries({ queryKey: ["dues", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dues-summary", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to waive due");
    },
  });

  const onSubmit = (values: WaiveDueValues) => {
    mutation.mutate(values);
  };

  if (!due) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Waive Chanda Due">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-amber-900 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Exempt / Waive Balance</p>
            <p className="text-amber-800 text-xs mt-1">
              Waiving marks this due ({formatCurrency(due.amount)} for {due.period}) as WAIVED.
              It will no longer show in outstanding balances or defaulter lists. This action is
              permanently logged in the audit trail.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Reason for Waiver <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="e.g. Financial hardship exemption approved by committee..."
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
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Waiving...
              </>
            ) : (
              "Confirm Waiver"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

