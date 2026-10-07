"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Loader2, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { generateDuesSchema, type GenerateDuesValues } from "./validation";

interface GenerateDuesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function GenerateDuesDialog({
  isOpen,
  onClose,
  mosqueId,
}: GenerateDuesDialogProps) {
  const queryClient = useQueryClient();

  const currentMonth = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenerateDuesValues>({
    resolver: zodResolver(generateDuesSchema),
    defaultValues: {
      period: currentMonth,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ period: currentMonth });
    }
  }, [isOpen, currentMonth, reset]);

  const mutation = useMutation({
    mutationFn: async (values: GenerateDuesValues) => {
      return apiClient.post(`/mosques/${mosqueId}/dues/generate`, values);
    },
    onSuccess: (res: any) => {
      toast.success(res.message || "Monthly dues generated successfully.");
      queryClient.invalidateQueries({ queryKey: ["dues", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dues-summary", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate dues");
    },
  });

  const onSubmit = (values: GenerateDuesValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Monthly Dues">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg flex items-start space-x-3 text-[#006B5B] text-sm">
          <Sparkles className="w-5 h-5 text-[#006B5B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Batch Dues Generator</p>
            <p className="text-gray-600 text-xs mt-1">
              This process scans all active Chanda plans and generates an unpaid due invoice for the
              specified calendar month. Generation is idempotent—duplicate dues will never be created
              for the same plan and period.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Target Period (YYYY-MM) <span className="text-red-500">*</span>
          </label>
          <Input placeholder="YYYY-MM (e.g. 2026-07)" {...register("period")} />
          {errors.period && (
            <p className="text-xs text-red-600">{errors.period.message}</p>
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
            className="bg-[#006B5B] hover:bg-[#005246] text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Dues...
              </>
            ) : (
              "Generate Dues"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

