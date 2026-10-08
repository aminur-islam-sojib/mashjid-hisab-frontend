import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface ReopenPeriodParams {
  period: string;
  reason: string;
}

export function useReopenPeriod(mosqueId: string, onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: async ({ period, reason }: ReopenPeriodParams) =>
      apiClient.post(`/mosques/${mosqueId}/periods/${period}/reopen`, { reason }),
    onSuccess: (_data, { period }) => {
      toast.success(`Accounting period ${period} reopened.`);
      onSuccessCallback?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reopen accounting period");
    },
  });
}

