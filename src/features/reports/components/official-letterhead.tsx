"use client";

import * as React from "react";
import { Landmark, CheckCircle2, ShieldCheck } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";
import { Badge } from "@/components/ui/badge";

interface OfficialLetterheadProps {
  title: string;
  subtitle?: string;
  periodLabel: string;
  reportRef?: string;
  isReconciled?: boolean;
}

export function OfficialLetterhead({
  title,
  subtitle = "Official Accounting Statement / আনুষ্ঠানিক হিসাব বিবরণী",
  periodLabel,
  reportRef,
  isReconciled = true,
}: OfficialLetterheadProps) {
  const { activeMosque } = useMosque();

  const generatedDate = React.useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const generatedRef = React.useMemo(() => {
    if (reportRef) return reportRef;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const slug = (activeMosque?.slug || "MH").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    return `${slug}-REP-${y}${m}`;
  }, [reportRef, activeMosque]);

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-5 shadow-xs space-y-4 print:border-b-2 print:border-gray-900 print:rounded-none print:shadow-none print:p-0 print:pb-4">
      {/* Top Header: Mosque Crest & Legal Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/80 pb-3.5 print:border-gray-300">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 print:border-gray-800 print:text-gray-900">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight uppercase print:text-gray-900">
              {activeMosque?.name || "Jame Mosque Financial Management"}
            </h1>
            <p className="text-xs text-muted-foreground print:text-gray-600">
              {activeMosque?.address || "Bangladesh"}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground print:text-gray-500">
              <span className="font-medium">Tenant: {activeMosque?.slug || activeMosque?.id}</span>
              <span>&bull;</span>
              <span>System: Mashjid Hisab Pro</span>
            </div>
          </div>
        </div>

        {/* Audit Verification Stamp & Ref */}
        <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
          <div className="flex items-center gap-1.5">
            {isReconciled ? (
              <Badge variant="teal" className="text-[11px] rounded-md font-semibold gap-1 py-0.5 px-2 print:border print:border-gray-800 print:bg-transparent print:text-gray-900">
                <ShieldCheck className="w-3 h-3" />
                <span>Audited & Reconciled</span>
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px] rounded-md font-semibold py-0.5 px-2">
                Draft Statement
              </Badge>
            )}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground print:text-gray-600">
            Ref: <strong className="text-foreground print:text-gray-900">{generatedRef}</strong>
          </span>
        </div>
      </div>

      {/* Statement Subject & Parameters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground print:text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground print:text-gray-600">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground print:text-gray-700">
          <div className="bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 print:bg-transparent print:border-0 print:p-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 block">
              Period
            </span>
            <span className="font-semibold text-foreground print:text-gray-900">
              {periodLabel}
            </span>
          </div>
          <div className="bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 print:bg-transparent print:border-0 print:p-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 block">
              Currency
            </span>
            <span className="font-semibold text-foreground print:text-gray-900">
              BDT (৳)
            </span>
          </div>
          <div className="bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 print:bg-transparent print:border-0 print:p-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 block">
              Generated
            </span>
            <span className="font-semibold text-foreground print:text-gray-900">
              {generatedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

