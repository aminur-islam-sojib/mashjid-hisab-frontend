import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { IncomeExpenseGroupBy, DonorGroupBy, DonorStatus } from "../types";

export interface ExportReportParams {
  reportType: "INCOME_EXPENSE" | "BALANCES" | "DONORS" | "DASHBOARD";
  format?: "CSV" | "PDF";
  startDate?: string;
  endDate?: string;
  groupBy?: IncomeExpenseGroupBy;
  donorGroupBy?: DonorGroupBy;
  donorStatus?: DonorStatus;
}

export function useReportExport(mosqueId: string) {
  return useMutation({
    mutationFn: async ({
      reportType,
      format = "CSV",
      startDate,
      endDate,
      groupBy,
      donorGroupBy,
      donorStatus,
    }: ExportReportParams) => {
      const parameters: Record<string, unknown> = {};
      if (startDate) parameters["startDate"] = startDate;
      if (endDate) parameters["endDate"] = endDate;
      if (reportType === "INCOME_EXPENSE" && groupBy) {
        parameters["groupBy"] = groupBy;
      }
      if (reportType === "DONORS") {
        if (donorGroupBy) parameters["groupBy"] = donorGroupBy;
        if (donorStatus) parameters["status"] = donorStatus;
      }

      // 1. Initialize report export on the backend
      const exportInit = await apiClient.post<{ id?: string; exportId?: string }>(
        `/mosques/${mosqueId}/reports/exports`,
        {
          reportType,
          format,
          parameters,
        }
      );

      const exportId = exportInit?.id || exportInit?.exportId;
      if (!exportId) {
        throw new Error("Unable to create export on server.");
      }

      // 2. Fetch completed export data with authenticated credentials
      const exportRecord = await apiClient.get<{
        id: string;
        content?: string;
        fileName?: string;
        mimeType?: string;
      }>(`/mosques/${mosqueId}/reports/exports/${exportId}`);

      return exportRecord;
    },
    onSuccess: (data) => {
      if (!data?.content) {
        toast.error("Export content is empty.");
        return;
      }

      const mimeType = data.mimeType || "text/csv;charset=utf-8;";
      const blob = new Blob([data.content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", data.fileName || "financial_statement.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Statement CSV downloaded successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate export");
    },
  });
}

