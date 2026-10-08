import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ChandaPlan, PaginatedResult } from "../types";

export function useChandaPlans(mosqueId: string, enabled: boolean = true) {
  return useQuery<PaginatedResult<ChandaPlan> | ChandaPlan[]>({
    queryKey: ["chanda-plans", mosqueId],
    queryFn: () =>
      apiClient.get<PaginatedResult<ChandaPlan> | ChandaPlan[]>(
        `/mosques/${mosqueId}/chanda-plans?limit=100`
      ),
    enabled: !!mosqueId && enabled,
  });
}
