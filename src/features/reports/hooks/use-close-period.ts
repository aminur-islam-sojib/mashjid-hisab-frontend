import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export function useClosePeriod(mosqueId: string) {
  return useMutation({
    mutationFn: async (period: string) =>
      apiClient.post(`/mosques/${mosqueId}/periods/${period}/close`),
    onSuccess: (_data, period) => {
      toast.success(`Accounting period ${period} closed and locked.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to close accounting period");
    },
  });
}

