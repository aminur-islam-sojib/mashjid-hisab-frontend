"use client";

import * as React from "react";
import { Download, Printer, MoreVertical, FileText, CheckCircle2, FileCheck2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsHeaderProps {
  onExportCsv: () => void;
  onPrintPdf: () => void;
  isExporting: boolean;
  selectedPeriodLabel?: string;
  isOfficialMode: boolean;
  onToggleOfficialMode: (val: boolean) => void;
}

export function ReportsHeader({
  onExportCsv,
  onPrintPdf,
  isExporting,
  selectedPeriodLabel = "this period",
  isOfficialMode,
  onToggleOfficialMode,
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-foreground">
            Financial Statements & Reports
          </h1>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md hidden sm:inline">
            Official Accounting
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Audited statements for {selectedPeriodLabel}. Reconciled across physical accounts and designated funds.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        {/* Toggle Mode: Executive View vs Official Statement */}
        <div className="flex items-center p-0.5 bg-muted/60 border border-border rounded-md">
          <button
            type="button"
            onClick={() => onToggleOfficialMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              !isOfficialMode
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Executive</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleOfficialMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              isOfficialMode
                ? "bg-card text-primary font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-primary" />
            <span>Official Statement</span>
          </button>
        </div>

        {/* Primary Action: Print / PDF */}
        <Button
          type="button"
          onClick={onPrintPdf}
          className="text-xs font-semibold gap-1.5 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </Button>

        {/* More Actions (CSV Export) */}
        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 border-border bg-card hover:bg-muted text-muted-foreground rounded-md"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-card border border-border rounded-md shadow-lg p-1 z-30 text-xs animate-in fade-in-0 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onExportCsv();
                }}
                disabled={isExporting}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-muted font-medium text-foreground flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
