import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export function usePlanMutations(mosqueId: string) {
  const queryClient = useQueryClient();

  const pausePlanMutation = useMutation({
    mutationFn: async (planId: string) =>
      apiClient.post(`/mosques/${mosqueId}/chanda-plans/${planId}/pause`),
    onSuccess: () => {
      toast.success("Plan paused.");
      queryClient.invalidateQueries({ queryKey: ["chanda-plans", mosqueId] });
    },
  });

  const resumePlanMutation = useMutation({
    mutationFn: async (planId: string) =>
      apiClient.post(`/mosques/${mosqueId}/chanda-plans/${planId}/resume`),
    onSuccess: () => {
      toast.success("Plan resumed.");
      queryClient.invalidateQueries({ queryKey: ["chanda-plans", mosqueId] });
    },
  });

  const endPlanMutation = useMutation({
    mutationFn: async (planId: string) =>
      apiClient.post(`/mosques/${mosqueId}/chanda-plans/${planId}/end`),
    onSuccess: () => {
      toast.success("Plan ended.");
      queryClient.invalidateQueries({ queryKey: ["chanda-plans", mosqueId] });
    },
  });

  return {
    pausePlanMutation,
    resumePlanMutation,
    endPlanMutation,
  };
}

