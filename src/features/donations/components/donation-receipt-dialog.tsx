"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, poishaToWords, majorToPoisha } from "@/lib/money";
import { DonationReceiptData } from "../types";
import { MosqueLogo } from "@/components/brand/logo";
import {
  Printer,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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
    queryFn: () =>
      apiClient.get<DonationReceiptData>(
        `/mosques/${mosqueId}/donations/${donationId}/receipt`
      ),
    enabled: isOpen && !!donationId,
  });

  const handlePrint = () => {
    if (!receipt) return;
    const originalTitle = document.title;
    if (receipt.receiptNumber) {
      document.title = `Receipt-${receipt.receiptNumber}`;
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Safe calculation of poisha amount and formatted text
  const rawPoisha = React.useMemo(() => {
    if (!receipt) return "0";
    if (typeof receipt.amount === "object" && receipt.amount !== null) {
      return receipt.amount.raw ?? majorToPoisha(receipt.amount.formatted || "0");
    }
    return String(receipt.amount || "0");
  }, [receipt]);

  const formattedAmount = React.useMemo(() => {
    return formatCurrency(rawPoisha);
  }, [rawPoisha]);

  const amountInWords = React.useMemo(() => {
    return poishaToWords(rawPoisha);
  }, [rawPoisha]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("receipt-modal-open");
    } else {
      document.body.classList.remove("receipt-modal-open");
    }
    return () => {
      document.body.classList.remove("receipt-modal-open");
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Donation Receipt"
      description="Cryptographically verifiable payment receipt issued to donor."
      className="max-w-2xl sm:max-w-3xl"
      usePortal={true}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body > *:not(.modal-portal) {
            display: none !important;
          }
          .modal-portal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .modal-portal > div:first-child {
            display: none !important;
          }
          .receipt-sheet {
            box-shadow: none !important;
            border: 2px solid #0f172a !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Generating verified receipt...</p>
        </div>
      ) : isError || !receipt ? (
        <div className="py-10 text-center space-y-3">
          <AlertCircle className="w-9 h-9 text-destructive mx-auto" />
          <p className="text-base font-semibold text-destructive">
            Could not load receipt data
          </p>
          <p className="text-xs text-muted-foreground">
            Please try again or contact the administrator.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Authentic Printable Receipt Voucher */}
          <div className="receipt-sheet relative rounded-xl border-2 border-primary/20 dark:border-border bg-card text-foreground shadow-sm p-6 sm:p-8 space-y-6 print:border-2 print:border-slate-800 print:rounded-none print:shadow-none print:p-8 print:w-full print:bg-white print:text-black">
            {/* Watermark for Voided status if applicable */}
            {receipt.isVoided && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 opacity-15">
                <span className="text-7xl sm:text-8xl font-black font-mono tracking-widest text-destructive rotate-[-25deg] uppercase border-8 border-destructive p-4">
                  VOIDED
                </span>
              </div>
            )}

            {/* Receipt Header Banner */}
            <div className="pb-5 border-b-2 border-primary/20 print:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MosqueLogo size="md" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground tracking-tight print:text-black uppercase">
                      {receipt.mosque.name}
                    </h2>
                    <p className="text-xs text-muted-foreground print:text-slate-600">
                      {receipt.mosque.address ||
                        "Registered Islamic Religious Institution"}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-muted/50 print:bg-slate-50 border border-border print:border-slate-300 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground print:text-slate-600 block">
                    Receipt Number / রসিদ নং
                  </span>
                  <span className="font-mono font-bold text-base text-primary print:text-black">
                    {receipt.receiptNumber}
                  </span>
                  <div className="text-[10px] font-medium text-muted-foreground print:text-slate-600 mt-0.5">
                    ORIGINAL VOUCHER / মূল কপি
                  </div>
                </div>
              </div>

              {/* Title Ribbon */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold text-xs tracking-wider uppercase print:bg-slate-100 print:text-black print:border-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OFFICIAL DONATION RECEIPT • অর্থ প্রাপ্তি রসিদ</span>
                </div>
              </div>
            </div>

            {/* Metadata Bar (Date, Time, Status, Source) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/40 dark:bg-muted/20 print:bg-slate-50 border border-border/80 print:border-slate-300 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground print:text-slate-500 uppercase font-semibold block">
                  Date / তারিখ
                </span>
                <span className="font-medium text-foreground print:text-black">
                  {new Date(receipt.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground print:text-slate-500 uppercase font-semibold block">
                  Payment Mode / মাধ্যম
                </span>
                <span className="font-medium text-foreground print:text-black capitalize">
                  {receipt.source.toLowerCase().replace(/_/g, " ")}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground print:text-slate-500 uppercase font-semibold block">
                  Status / অবস্থা
                </span>
                {receipt.isVoided ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                    <XCircle className="w-3 h-3" /> Voided
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 print:text-black">
                    <CheckCircle2 className="w-3 h-3" /> Posted & Verified
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground print:text-slate-500 uppercase font-semibold block">
                  Account / হিসাব
                </span>
                <span className="font-medium text-foreground print:text-black truncate block">
                  {receipt.account?.name || "Masjid Account"}
                </span>
              </div>
            </div>

            {/* Donor & Purpose Table */}
            <div className="border border-border print:border-slate-400 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-border print:border-slate-300">
                    <td className="w-1/3 p-3 bg-muted/30 print:bg-slate-100 font-semibold text-muted-foreground print:text-slate-700">
                      Received With Thanks From <br />
                      <span className="text-[11px] font-normal text-muted-foreground print:text-slate-500">
                        (দাতার নাম ও পরিচয়)
                      </span>
                    </td>
                    <td className="p-3 text-foreground print:text-black">
                      <div className="font-bold text-sm text-foreground print:text-black">
                        {receipt.donor.name || "Anonymous Donor (সাধারণ দানকারী)"}
                      </div>
                      {(receipt.donor.phone || receipt.donor.email) && (
                        <div className="text-[11px] text-muted-foreground print:text-slate-600 mt-0.5 space-x-2">
                          {receipt.donor.phone && (
                            <span>Phone: {receipt.donor.phone}</span>
                          )}
                          {receipt.donor.email && (
                            <span>Email: {receipt.donor.email}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  <tr className="border-b border-border print:border-slate-300">
                    <td className="p-3 bg-muted/30 print:bg-slate-100 font-semibold text-muted-foreground print:text-slate-700">
                      Allocated Fund & Purpose <br />
                      <span className="text-[11px] font-normal text-muted-foreground print:text-slate-500">
                        (তহবিল ও খাত)
                      </span>
                    </td>
                    <td className="p-3 text-foreground print:text-black">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {receipt.fund.name}
                        </span>
                        {receipt.fund.isRestricted && (
                          <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded print:bg-slate-100 print:text-black print:border-slate-400">
                            Restricted Fund / নির্দিষ্ট উদ্দেশ্য
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground print:text-slate-600 mt-0.5">
                        Category: {receipt.category.name}
                      </div>
                    </td>
                  </tr>

                  {receipt.notes && (
                    <tr className="border-b border-border print:border-slate-300">
                      <td className="p-3 bg-muted/30 print:bg-slate-100 font-semibold text-muted-foreground print:text-slate-700">
                        Notes / Remarks <br />
                        <span className="text-[11px] font-normal text-muted-foreground print:text-slate-500">
                          (বিশেষ মন্তব্য)
                        </span>
                      </td>
                      <td className="p-3 text-foreground print:text-black italic">
                        {receipt.notes}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Prominent Amount Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-2 border-primary/30 print:border-2 print:border-slate-800 print:bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground print:text-slate-700 block">
                    Total Amount Received / মোট প্রাপ্ত টাকা
                  </span>
                  <span className="text-xs text-muted-foreground print:text-slate-600">
                    Currency: Bangladeshi Taka (BDT)
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-3xl sm:text-4xl font-extrabold font-heading text-primary print:text-black tracking-tight">
                    {formattedAmount}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-primary/20 print:border-slate-400 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-muted-foreground print:text-slate-700 shrink-0">
                  In Words / কথায়:
                </span>
                <span className="font-medium text-foreground print:text-black italic">
                  {amountInWords}
                </span>
              </div>
            </div>

            {/* Cryptographic Verification & Audit Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-muted/30 print:bg-slate-50 border border-border/60 print:border-slate-300 text-[11px]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground print:text-black">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary print:text-black" />
                  <span>
                    Security Verification Code:{" "}
                    <strong className="font-mono text-xs">
                      {receipt.verificationCode}
                    </strong>
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground print:text-slate-600">
                  Audited & posted to Mashjid Hisab immutable general ledger.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-primary text-[10px] font-semibold print:text-black print:border-slate-500">
                  ✓ OFFICIALLY AUDITED
                </div>
              </div>
            </div>

            {/* Dual Signatures */}
            <div className="pt-8 sm:pt-12 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-foreground/30 print:border-black w-3/4 mx-auto pt-1.5">
                  <p className="font-bold text-foreground print:text-black">
                    Donor / Depositor
                  </p>
                  <p className="text-[10px] text-muted-foreground print:text-slate-600">
                    দাতার স্বাক্ষর / জমাদানকারী
                  </p>
                </div>
              </div>

              <div>
                <div className="border-t border-foreground/30 print:border-black w-3/4 mx-auto pt-1.5">
                  <p className="font-bold text-foreground print:text-black">
                    Authorized Signatory / Treasurer
                  </p>
                  <p className="text-[10px] text-muted-foreground print:text-slate-600">
                    কোষাধ্যক্ষ / অনুমোদিত স্বাক্ষর
                  </p>
                </div>
              </div>
            </div>

            {/* Spiritual Dua / Islamic Blessing */}
            <div className="pt-4 border-t border-border/60 print:border-slate-300 text-center space-y-1">
              <p className="font-serif text-sm text-primary print:text-black font-semibold">
                جَزَاكُمُ اللَّهُ خَيْرًا
              </p>
              <p className="text-[11px] text-muted-foreground print:text-slate-600 italic">
                “May Allah accept your contribution, grant immense barakah in your wealth, and reward you abundantly.”
              </p>
              <p className="text-[10px] text-muted-foreground/80 print:text-slate-500">
                আল্লাহ আপনার দান কবুল করুন এবং উভয় জাহানে উত্তম প্রতিদান দান করুন। আমীন।
              </p>
            </div>
          </div>

          {/* Action buttons (Hidden during printing, sticky on screen) */}
          <div className="sticky -bottom-1 bg-card/95 backdrop-blur-xs pt-3 pb-1 border-t border-border flex items-center justify-end gap-2.5 z-20 print:hidden">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
