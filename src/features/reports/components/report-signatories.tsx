"use client";

 

export function ReportSignatories() {
  return (
    <div className="pt-8 pb-4 border-t border-border mt-8 print:border-gray-900 print:mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-center text-xs">
        {/* Signatory 1: Prepared */}
        <div className="flex flex-col items-center">
          <div className="w-48 border-b border-dashed border-border/80 pb-1 mb-2 print:border-gray-900" />
          <p className="font-bold text-foreground print:text-gray-900">Prepared By</p>
          <p className="text-[11px] text-muted-foreground print:text-gray-600">Accountant / Office Secretary</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 print:text-gray-500">হিসাব সহকারী / খাদেম</p>
        </div>

        {/* Signatory 2: Verified */}
        <div className="flex flex-col items-center">
          <div className="w-48 border-b border-dashed border-border/80 pb-1 mb-2 print:border-gray-900" />
          <p className="font-bold text-foreground print:text-gray-900">Verified & Audited By</p>
          <p className="text-[11px] text-muted-foreground print:text-gray-600">Treasurer / Audit Committee</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 print:text-gray-500">কোষাধ্যক্ষ / অডিট কমিটি</p>
        </div>

        {/* Signatory 3: Approved */}
        <div className="flex flex-col items-center">
          <div className="w-48 border-b border-dashed border-border/80 pb-1 mb-2 print:border-gray-900" />
          <p className="font-bold text-foreground print:text-gray-900">Approved By</p>
          <p className="text-[11px] text-muted-foreground print:text-gray-600">President / Mutawalli</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 print:text-gray-500">সভাপতি / মোতাওয়াল্লী</p>
        </div>
      </div>

      <div className="text-center mt-6 text-[10px] text-muted-foreground print:text-gray-500">
        This document is an authentic financial statement issued under dual-control authorization on Mashjid Hisab Pro. Any discrepancies must be submitted in writing within 15 days of notice board posting.
      </div>
    </div>
  );
}

