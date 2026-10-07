"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckSquare, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { majorToPoisha } from "@/lib/money";
import { campaignSchema, type CampaignValues } from "./validation";

interface CampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function CampaignDialog({
  isOpen,
  onClose,
  mosqueId,
}: CampaignDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema) as any,
    defaultValues: {
      title: "",
      fundId: "",
      targetAmountMajor: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "",
      isPublic: true,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        fundId: "",
        targetAmountMajor: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        description: "",
        isPublic: true,
      });
    }
  }, [isOpen, reset]);

  // Fetch Funds
  const { data: funds } = useQuery({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (values: CampaignValues) => {
      const payload: Record<string, any> = {
        title: values.title,
        fundId: values.fundId,
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
        description: values.description || undefined,
        isPublic: values.isPublic,
      };

      if (values.targetAmountMajor && values.targetAmountMajor.trim()) {
        payload.targetAmount = majorToPoisha(values.targetAmountMajor).toString();
      }

      return apiClient.post(`/mosques/${mosqueId}/campaigns`, payload);
    },
    onSuccess: () => {
      toast.success("Fundraising campaign created successfully.");
      queryClient.invalidateQueries({ queryKey: ["campaigns", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create campaign");
    },
  });

  const onSubmit = (values: CampaignValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Fundraising Campaign">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Campaign Title <span className="text-red-500">*</span>
          </label>
          <Input placeholder="e.g. Ramadan Iftar Drive 2026" {...register("title")} />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Linked Fund <span className="text-red-500">*</span>
            </label>
            <select
              {...register("fundId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="">Select Fund</option>
              {funds?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {errors.fundId && (
              <p className="text-xs text-red-600">{errors.fundId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Target Goal (BDT)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 500000"
              {...register("targetAmountMajor")}
            />
            {errors.targetAmountMajor && (
              <p className="text-xs text-red-600">{errors.targetAmountMajor.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Input type="date" {...register("startDate")} />
            {errors.startDate && (
              <p className="text-xs text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              End Date (Optional)
            </label>
            <Input type="date" {...register("endDate")} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Description / Appeal
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Describe the objective and how funds will be deployed..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-800 block">
              Public Visibility
            </span>
            <span className="text-xs text-gray-500">
              Display this campaign and progress bar on the public community portal
            </span>
          </div>
          <input
            type="checkbox"
            {...register("isPublic")}
            className="h-4 w-4 rounded text-[#006B5B] focus:ring-[#006B5B]"
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
            className="bg-[#006B5B] hover:bg-[#005246] text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
