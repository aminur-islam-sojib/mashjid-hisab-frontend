import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DuesSummary } from "../types";

export function useDuesSummary(
  mosqueId: string,
  selectedPeriod: string,
  enabled: boolean = true
) {
  return useQuery<DuesSummary>({
    queryKey: ["dues-summary", mosqueId, selectedPeriod],
    queryFn: () =>
      apiClient.get<DuesSummary>(
        `/mosques/${mosqueId}/dues/summary?period=${selectedPeriod}`
      ),
    enabled: !!mosqueId && enabled,
  });
}

