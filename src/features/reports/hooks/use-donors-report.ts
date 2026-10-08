import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DonorsReport, DonorGroupBy, DonorStatus } from "../types";

export function useDonorsReport(
  mosqueId: string,
  startDate: string,
  endDate: string,
  donorGroupBy: DonorGroupBy,
  donorStatus: DonorStatus,
  enabled: boolean = true
) {
  return useQuery<DonorsReport>({
    queryKey: ["report-donors", mosqueId, startDate, endDate, donorGroupBy, donorStatus],
    queryFn: () => {
      const p = new URLSearchParams({
        startDate,
        endDate,
        groupBy: donorGroupBy,
        status: donorStatus,
        limit: "50",
      });
      return apiClient.get<DonorsReport>(
        `/mosques/${mosqueId}/reports/donors?${p.toString()}`
      );
    },
    enabled: !!mosqueId && enabled,
  });
}

