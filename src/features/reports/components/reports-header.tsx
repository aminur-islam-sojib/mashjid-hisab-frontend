import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsHeaderProps {
  onExport: () => void;
  isExporting: boolean;
}

export function ReportsHeader({ onExport, isExporting }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Financial Statements & Period Audit
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Auditable balance sheets, income/expense breakdown, donor analysis, and monthly period locks.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="text-xs border-[#006B5B] text-[#006B5B] hover:bg-[#E6F4F0]"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          {isExporting ? "Exporting..." : "Export Statement (CSV)"}
        </Button>
      </div>
    </div>
  );
}

