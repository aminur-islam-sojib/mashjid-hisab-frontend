import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DueRecord, PaginatedResult } from "../types";

export function useDues(
  mosqueId: string,
  selectedPeriod: string,
  statusFilter: string,
  enabled: boolean = true
) {
  return useQuery<PaginatedResult<DueRecord> | DueRecord[]>({
    queryKey: ["dues", mosqueId, selectedPeriod, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.append("limit", "100");
      if (selectedPeriod) p.append("period", selectedPeriod);
      if (statusFilter) p.append("status", statusFilter);

      return apiClient.get<PaginatedResult<DueRecord> | DueRecord[]>(
        `/mosques/${mosqueId}/dues?${p.toString()}`
      );
    },
    enabled: !!mosqueId && enabled,
  });
}
