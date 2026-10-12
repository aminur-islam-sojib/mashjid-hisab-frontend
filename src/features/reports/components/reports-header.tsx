"use client";

import * as React from "react";
import { Download, Printer, MoreVertical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsHeaderProps {
  onExportCsv: () => void;
  onPrintPdf: () => void;
  isExporting: boolean;
  selectedPeriodLabel?: string;
}

export function ReportsHeader({
  onExportCsv,
  onPrintPdf,
  isExporting,
  selectedPeriodLabel = "this period",
}: ReportsHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          How much did we collect and spend?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 print:hidden">
          Financial summary for {selectedPeriodLabel}. Plain numbers, reconciled across cash and funds.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 print:hidden">
        {/* Single primary button: Download PDF */}
        <Button
          type="button"
          onClick={onPrintPdf}
          className="text-xs sm:text-sm font-semibold shadow-xs"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          <span>Download PDF</span>
        </Button>

        {/* ⋯ Dropdown Menu for CSV and Print */}
        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 border-border bg-card hover:bg-muted text-muted-foreground"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-card border border-border rounded-xl shadow-lg p-1.5 z-30 text-xs animate-in fade-in-0 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onExportCsv();
                }}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium text-foreground flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onPrintPdf();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium text-foreground flex items-center gap-2 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Print Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
