import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { BalancesReport } from "../types";

export function useBalancesReport(mosqueId: string, enabled: boolean = true) {
  return useQuery<BalancesReport>({
    queryKey: ["report-balances", mosqueId],
    queryFn: () => apiClient.get<BalancesReport>(`/mosques/${mosqueId}/reports/balances`),
    enabled: !!mosqueId && enabled,
  });
}

