import * as React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsHeaderProps {
  onExportCsv: () => void;
  onPrintPdf: () => void;
  isExporting: boolean;
}

export function ReportsHeader({
  onExportCsv,
  onPrintPdf,
  isExporting,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Financial Statements & Period Audit
        </h1>
        <p className="text-sm text-gray-500 mt-1 print:hidden">
          Auditable balance sheets, income/expense breakdown, donor analysis, and monthly period locks.
        </p>
      </div>

      <div className="flex items-center space-x-2.5 print:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={onPrintPdf}
          className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          <span>Print / Save PDF</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onExportCsv}
          disabled={isExporting}
          className="text-xs border-[#006B5B] text-[#006B5B] hover:bg-[#E6F4F0]"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span>{isExporting ? "Exporting..." : "Export (CSV)"}</span>
        </Button>
      </div>
    </div>
  );
}

