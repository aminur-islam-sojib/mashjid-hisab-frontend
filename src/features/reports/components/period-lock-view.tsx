import * as React from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeriodLockViewProps {
  targetPeriod: string;
  onTargetPeriodChange: (val: string) => void;
  onClosePeriod: () => void;
  onOpenReopenModal: () => void;
  isClosing: boolean;
}

export function PeriodLockView({
  targetPeriod,
  onTargetPeriodChange,
  onClosePeriod,
  onOpenReopenModal,
  isClosing,
}: PeriodLockViewProps) {
  return (
    <div className="max-w-2xl bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-6">
      <div className="flex items-start space-x-3 text-gray-900">
        <Lock className="w-6 h-6 text-[#006B5B] shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold">Accounting Period Lock Control</h3>
          <p className="text-xs text-gray-500 mt-1">
            Once a monthly accounting period is closed, all financial transactions dated
            within that month become strictly immutable and cannot be edited, posted, or voided.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Target Period (YYYY-MM)
        </label>
        <input
          type="month"
          value={targetPeriod}
          onChange={(e) => onTargetPeriodChange(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
        />
      </div>

      <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white text-xs"
          onClick={onClosePeriod}
          disabled={isClosing}
        >
          <Lock className="w-3.5 h-3.5 mr-1.5" />
          {isClosing ? "Closing..." : "Close & Lock Period"}
        </Button>

        <Button
          variant="outline"
          className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
          onClick={onOpenReopenModal}
        >
          <Unlock className="w-3.5 h-3.5 mr-1.5" />
          Reopen Period
        </Button>
      </div>
    </div>
  );
}

