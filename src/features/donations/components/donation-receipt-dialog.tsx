"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { DonationReceiptData } from "../types";
import { MosqueLogo } from "@/components/brand/logo";
import { Printer, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

interface DonationReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  donationId: string | null;
}

export function DonationReceiptDialog({
  isOpen,
  onClose,
  mosqueId,
  donationId,
}: DonationReceiptDialogProps) {
  const { data: receipt, isLoading, isError } = useQuery<DonationReceiptData>({
    queryKey: ["mosque", mosqueId, "donation-receipt", donationId],
    queryFn: () => apiClient.get<DonationReceiptData>(`/mosques/${mosqueId}/donations/${donationId}/receipt`),
    enabled: isOpen && !!donationId,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Donation Receipt"
      description="Cryptographically verifiable payment receipt issued to donor."
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Generating receipt...</p>
        </div>
      ) : isError || !receipt ? (
        <div className="py-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm font-semibold text-destructive">Could not load receipt data</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Printable Receipt Box */}
          <div className="p-6 rounded-2xl border-2 border-border bg-card text-foreground space-y-4 print:p-0 print:border-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <MosqueLogo size="md" />
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Receipt No.</span>
                <p className="font-mono font-bold text-sm text-foreground">{receipt.receiptNumber}</p>
              </div>
            </div>

            {/* Main details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground font-medium">Mosque Institution:</p>
                <p className="font-semibold text-foreground text-sm">{receipt.mosque.name}</p>
                {receipt.mosque.address && (
                  <p className="text-[11px] text-muted-foreground">{receipt.mosque.address}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-muted-foreground font-medium">Date Issued:</p>
                <p className="font-semibold text-foreground">
                  {new Date(receipt.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Donor & Fund Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-border/60">
              <div>
                <p className="text-muted-foreground font-medium">Received From:</p>
                <p className="font-bold text-sm text-foreground">{receipt.donor.name || "Anonymous Donor"}</p>
                {receipt.donor.phone && (
                  <p className="text-[11px] text-muted-foreground">{receipt.donor.phone}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-muted-foreground font-medium">Allocated Fund:</p>
                <p className="font-semibold text-foreground">{receipt.fund.name}</p>
                <p className="text-[11px] text-muted-foreground">{receipt.category.name}</p>
              </div>
            </div>

            {/* Total Amount Badge */}
            <div className="p-4 rounded-xl bg-secondary/60 dark:bg-muted/40 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Amount Contributed</span>
                <p className="text-xs text-muted-foreground capitalize">{receipt.source.toLowerCase().replace("_", " ")}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-heading text-primary">
                  {formatCurrency(receipt.amount)}
                </p>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-2 text-center border-t border-border/60">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Verification Code: <strong className="font-mono text-foreground">{receipt.verificationCode}</strong></span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Verifiable online at /public/receipts/{receipt.verificationCode}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" /> Print Receipt
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

