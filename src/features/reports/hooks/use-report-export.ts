import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { IncomeExpenseGroupBy } from "../types";

interface ExportReportParams {
  reportType: string;
  format: string;
  startDate: string;
  endDate: string;
  groupBy: IncomeExpenseGroupBy;
}

export function useReportExport(mosqueId: string) {
  return useMutation({
    mutationFn: ({ reportType, format, startDate, endDate, groupBy }: ExportReportParams) =>
      apiClient.post<{ id?: string }>(`/mosques/${mosqueId}/reports/exports`, {
        reportType,
        format,
        parameters: { startDate, endDate, groupBy },
      }),
    onSuccess: (data: { id?: string }) => {
      toast.success("Export generated successfully!");
      if (data?.id) {
        window.open(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/mosques/${mosqueId}/reports/exports/${data.id}?download=true`,
          "_blank"
        );
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate export");
    },
  });
}

