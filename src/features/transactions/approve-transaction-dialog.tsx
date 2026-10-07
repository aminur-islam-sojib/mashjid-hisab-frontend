"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useAuth } from "@/providers/auth-provider";
import { UnifiedTransactionItem } from "./types";

interface ApproveTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  transaction: UnifiedTransactionItem | null;
}

export function ApproveTransactionDialog({
  isOpen,
  onClose,
  mosqueId,
  transaction,
}: ApproveTransactionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isSelfCreated =
    Boolean(user?.id && transaction?.createdById && user.id === transaction.createdById);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!transaction) return;
      return apiClient.post(
        `/mosques/${mosqueId}/transactions/${transaction.id}/approve`
      );
    },
    onSuccess: () => {
      toast.success("Transaction approved and posted to ledger.");
      queryClient.invalidateQueries({ queryKey: ["transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["pending-transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["funds", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to approve transaction");
    },
  });

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Transaction">
      <div className="space-y-4">
        {isSelfCreated ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-amber-900 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Dual-Control Restriction</p>
              <p className="text-amber-800 text-xs mt-1">
                You created this entry. In accordance with mosque financial governance
                and segregation of duties, self-approval is not permitted. Another authorized
                officer (Admin or Treasurer) must verify and approve this transaction.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg flex items-start space-x-3 text-[#006B5B] text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#006B5B] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Ready for Posting</p>
              <p className="text-gray-600 text-xs mt-1">
                Approving this transaction will transition its status to POSTED, assign an official
                voucher/receipt sequence number, and update account and fund ledger balances.
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction Type</span>
            <span className="font-semibold text-gray-900">{transaction.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-[#006B5B]">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Party / Source</span>
            <span className="text-gray-900 font-medium">
              {transaction.party || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fund</span>
            <span className="text-gray-900">{transaction.fundName || "General Fund"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account</span>
            <span className="text-gray-900">{transaction.accountName || "Main Account"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Recorded By</span>
            <span className="text-gray-900">
              {transaction.createdBy?.name || "Staff Member"}
            </span>
          </div>
          {transaction.notes && (
            <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Notes:</span> {transaction.notes}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#006B5B] hover:bg-[#005246] text-white"
            onClick={() => mutation.mutate()}
            disabled={isSelfCreated || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              "Confirm & Post"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

