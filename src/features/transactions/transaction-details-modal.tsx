"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CreditCard,
  FileText,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  Paperclip,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { UnifiedTransactionItem } from "./types";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  transactionId: string | null;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  mosqueId,
  transactionId,
}: TransactionDetailsModalProps) {
  const { data: transaction, isLoading } = useQuery<UnifiedTransactionItem>({
    queryKey: ["transaction-detail", mosqueId, transactionId],
    queryFn: async () => {
      if (!transactionId) throw new Error("No transaction selected");
      return apiClient.get<UnifiedTransactionItem>(
        `/mosques/${mosqueId}/transactions/${transactionId}`
      );
    },
    enabled: isOpen && Boolean(transactionId),
  });

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "POSTED":
        return <Badge variant="success">Posted</Badge>;
      case "PENDING":
      case "PENDING_APPROVAL":
        return <Badge variant="warning">Pending Approval</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      case "VOIDED":
        return <Badge variant="secondary">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "POSTED":
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "VOIDED":
        return <AlertOctagon className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-[#006B5B]" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Ledger Record">
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#006B5B]" />
          <p className="text-sm">Fetching ledger entry and audit timeline...</p>
        </div>
      ) : !transaction ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Transaction record could not be loaded.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {transaction.type}
                </span>
                {getStatusBadge(transaction.status)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {transaction.transactionNumber || "Ref: Pending"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(transaction.date).toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-medium">Total Amount</span>
              <div className="text-2xl font-black text-[#006B5B]">
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          </div>

          {/* Flow Matrix */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-xs">
              <span className="text-xs text-gray-400 font-medium">Fund Allocation</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {transaction.fundName || "General Fund"}
              </p>
              {transaction.toFundName && (
                <div className="flex items-center space-x-1 text-xs text-[#006B5B] mt-1 font-medium">
                  <span>To:</span>
                  <ArrowRight className="w-3 h-3 inline" />
                  <span>{transaction.toFundName}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-xs">
              <span className="text-xs text-gray-400 font-medium">Financial Account</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {transaction.accountName || "Main Account"}
              </p>
              {transaction.toAccountName && (
                <div className="flex items-center space-x-1 text-xs text-[#006B5B] mt-1 font-medium">
                  <span>To:</span>
                  <ArrowRight className="w-3 h-3 inline" />
                  <span>{transaction.toAccountName}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-xs">
              <span className="text-xs text-gray-400 font-medium">Party / Counterpart</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {transaction.party || "—"}
              </p>
            </div>

            <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-xs">
              <span className="text-xs text-gray-400 font-medium">Category</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {transaction.categoryName || "Uncategorized"}
              </p>
            </div>
          </div>

          {/* Notes & Attachments */}
          {(transaction.notes || (transaction.attachments && transaction.attachments.length > 0)) && (
            <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-lg text-sm space-y-2">
              {transaction.notes && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">Notes</span>
                  <p className="text-gray-700 text-xs mt-0.5">{transaction.notes}</p>
                </div>
              )}
              {transaction.attachments && transaction.attachments.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">
                    Voucher Attachments ({transaction.attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {transaction.attachments.map((id, idx) => (
                      <span
                        key={id}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700"
                      >
                        <Paperclip className="w-3 h-3 text-gray-400" />
                        <span>Attachment #{idx + 1}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Dual-Control Audit Timeline
            </h4>
            <div className="border-l-2 border-gray-200 ml-2 space-y-4 pl-4 py-1">
              {transaction.history && transaction.history.length > 0 ? (
                transaction.history.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-0.5 bg-white p-0.5 rounded-full border border-gray-200">
                      {getStepIcon(step.step)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {step.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(step.performedAt).toLocaleString()}
                        </span>
                      </div>
                      {step.performedBy && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          By: <span className="font-medium">{step.performedBy.name}</span>
                          {step.performedBy.email ? ` (${step.performedBy.email})` : ""}
                        </p>
                      )}
                      {Boolean(step.details?.reason) && (
                        <p className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded border border-red-100">
                          Reason: {String(step.details!.reason)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No extended audit history available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
