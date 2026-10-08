"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Coins,
  Calendar,
  Building2,
  Receipt,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";

function VerifyReceiptContent() {
  const params = useParams();
  const code = params["code"] as string;

  const { data: receipt, isLoading, isError, error } = useQuery<any>({
    queryKey: ["verify-receipt", code],
    queryFn: () => apiClient.get<any>(`/public/receipts/${code}`),
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4">
      <header className="max-w-md mx-auto w-full pt-8 pb-4 text-center">
        <div className="flex justify-center mb-2">
          <MosqueLogo size="md" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Receipt Authentication Service
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Cryptographically verified against the official mosque financial ledger.
        </p>
      </header>

      <main className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#006B5B] mx-auto" />
            <p className="text-sm text-gray-600 font-medium">
              Verifying receipt security code...
            </p>
          </div>
        ) : isError || !receipt ? (
          <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Invalid or Unverified Receipt
              </h2>
              <p className="text-xs text-red-600 mt-1">
                {(error as any)?.message ||
                  "The verification code does not match any posted donation in the ledger. Please check the code and try again."}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-500">
              Code: {code}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden">
            {/* Verification Banner */}
            <div className="bg-[#E6F4F0] p-6 border-b border-[#006B5B]/20 text-center space-y-2">
              <div className="w-12 h-12 bg-[#006B5B] text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="inline-block text-xs font-bold text-[#006B5B] uppercase tracking-wider">
                Authentic & Posted
              </span>
              <h2 className="text-2xl font-black text-gray-900">
                {formatCurrency(receipt.amount)}
              </h2>
              <p className="text-xs text-gray-600">
                Official Charitable Contribution Receipt
              </p>
            </div>

            {/* Receipt Details Matrix */}
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-400">Mosque</span>
                <span className="font-bold text-gray-900 text-right">
                  {receipt.mosque?.name || receipt.mosqueName || "Mosque"}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-400">Receipt Number</span>
                <span className="font-mono font-semibold text-gray-800">
                  {receipt.receiptNumber}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-400">Date</span>
                <span className="font-medium text-gray-800">
                  {new Date(receipt.date).toLocaleDateString("en-US", {
                    dateStyle: "long",
                  })}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-400">Target Fund</span>
                <span className="font-medium text-[#006B5B]">
                  {receipt.fund?.name || receipt.fundName || "General Fund"}
                </span>
              </div>

              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-400">Donor</span>
                <span className="font-medium text-gray-800">
                  {receipt.donorName || "Generous Donor"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Payment Channel</span>
                <span className="font-medium text-gray-800">
                  {receipt.source || "CASH"}
                </span>
              </div>
            </div>

            {/* Security Footer */}
            <div className="bg-gray-50/70 p-4 border-t border-gray-100 text-center">
              <span className="text-[11px] text-gray-400 block font-mono">
                Verification Hash: {code}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                ✓ Recorded and locked in mosque immutable ledger
              </span>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Mosque Management Cloud • Double-Entry Financial Governance
      </footer>
    </div>
  );
}

export default function VerifyReceiptPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#006B5B] mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Verifying receipt...</p>
          </div>
        </div>
      }
    >
      <VerifyReceiptContent />
    </React.Suspense>
  );
}
