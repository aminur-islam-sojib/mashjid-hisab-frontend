import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ReopenPeriodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetPeriod: string;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export function ReopenPeriodDialog({
  isOpen,
  onClose,
  targetPeriod,
  onConfirm,
  isPending,
}: ReopenPeriodDialogProps) {
  const [reopenReason, setReopenReason] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setReopenReason("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!reopenReason.trim() || isPending) return;
    onConfirm(reopenReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reopen Accounting Period: ${targetPeriod}`}
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
          Reopening a closed accounting period requires an audited formal justification.
          All ledger changes performed during the reopened state will be flagged in audit logs.
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Reason for Reopening <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Explain why adjustments are required for this locked period..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleConfirm}
            disabled={!reopenReason.trim() || isPending}
          >
            {isPending ? "Reopening..." : "Confirm Reopen"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

