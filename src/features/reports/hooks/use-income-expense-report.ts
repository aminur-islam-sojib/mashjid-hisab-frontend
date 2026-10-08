import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { IncomeExpenseReport, IncomeExpenseGroupBy } from "../types";

export function useIncomeExpenseReport(
  mosqueId: string,
  startDate: string,
  endDate: string,
  groupBy: IncomeExpenseGroupBy,
  enabled: boolean = true
) {
  return useQuery<IncomeExpenseReport>({
    queryKey: ["report-inc-exp", mosqueId, startDate, endDate, groupBy],
    queryFn: async () => {
      const p = new URLSearchParams({
        startDate,
        endDate,
        groupBy,
      });
      return apiClient.get<IncomeExpenseReport>(
        `/mosques/${mosqueId}/reports/income-expense?${p.toString()}`
      );
    },
    enabled: !!mosqueId && enabled,
  });
}

