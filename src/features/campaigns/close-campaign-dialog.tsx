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
import {
  closeCampaignSchema,
  type CloseCampaignValues,
} from "./validation";
import { CampaignItem } from "./types";

interface CloseCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  campaign: CampaignItem | null;
}

export function CloseCampaignDialog({
  isOpen,
  onClose,
  mosqueId,
  campaign,
}: CloseCampaignDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloseCampaignValues>({
    resolver: zodResolver(closeCampaignSchema),
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
    mutationFn: async (values: CloseCampaignValues) => {
      if (!campaign) return;
      return apiClient.post(
        `/mosques/${mosqueId}/campaigns/${campaign.id}/close`,
        values.reason ? { reason: values.reason } : {}
      );
    },
    onSuccess: () => {
      toast.success("Campaign closed.");
      queryClient.invalidateQueries({ queryKey: ["campaigns", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to close campaign");
    },
  });

  const onSubmit = (values: CloseCampaignValues) => {
    mutation.mutate(values);
  };

  if (!campaign) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Close Campaign">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Freeze Campaign Activity</p>
            <p className="text-amber-800 text-xs mt-1">
              Closing &ldquo;{campaign.title}&rdquo; will freeze this campaign. No further donations can
              be linked to it, and its progress metrics will remain archived for historical audits.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Closing Reason (Optional)
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="e.g. Target reached successfully..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
          />
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
                Closing...
              </>
            ) : (
              "Confirm & Close"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

