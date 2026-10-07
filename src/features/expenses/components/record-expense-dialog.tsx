"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExpenseSchema, CreateExpenseFormData } from "../validation";
import { FundItem } from "@/features/funds/types";
import { AccountItem } from "@/features/accounts/types";
import { CategoryItem } from "@/features/categories/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { majorToPoisha } from "@/lib/money";
import { Loader2, UploadCloud, FileCheck, X } from "lucide-react";

interface RecordExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  funds?: FundItem[];
  accounts?: AccountItem[];
  categories?: CategoryItem[];
  onSuccess: () => void;
}

export function RecordExpenseDialog({
  isOpen,
  onClose,
  mosqueId,
  funds,
  accounts,
  categories,
  onSuccess,
}: RecordExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);

  const expenseCategories = React.useMemo(() => {
    return categories?.filter((c) => c.type === "EXPENSE") || [];
  }, [categories]);

  const todayStr = new Date().toISOString().split("T")[0]!;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      amountMajor: "",
      accountId: accounts?.[0]?.id || "",
      fundId: funds?.[0]?.id || "",
      categoryId: expenseCategories?.[0]?.id || "",
      date: todayStr,
      payee: "",
      voucherNo: "",
      notes: "",
    },
  });

  const selectedFundId = watch("fundId");

  const filteredCategories = React.useMemo(() => {
    return expenseCategories.filter(
      (c) => !c.fundId || c.fundId === selectedFundId
    );
  }, [expenseCategories, selectedFundId]);

  React.useEffect(() => {
    if (isOpen) {
      reset({
        amountMajor: "",
        accountId: accounts?.[0]?.id || "",
        fundId: funds?.[0]?.id || "",
        categoryId: filteredCategories?.[0]?.id || "",
        date: todayStr,
        payee: "",
        voucherNo: "",
        notes: "",
      });
      setSelectedFile(null);
    }
  }, [isOpen, accounts, funds, filteredCategories, reset, todayStr]);

  const onSubmit = async (data: CreateExpenseFormData) => {
    if (!selectedFile) {
      toast.error("Voucher bill attachment required", {
        description: "Accounting policy requires an attached receipt, invoice, or bill voucher.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload attachment
      setIsUploadingFile(true);
      const uploadResult = await apiClient.upload<{ id: string }>(
        `/mosques/${mosqueId}/attachments`,
        selectedFile,
        selectedFile.name
      );
      setIsUploadingFile(false);

      const amountPoisha = majorToPoisha(data.amountMajor);

      // 2. Post expense record
      await apiClient.post(`/mosques/${mosqueId}/expenses`, {
        amount: amountPoisha,
        accountId: data.accountId,
        fundId: data.fundId,
        categoryId: data.categoryId,
        date: new Date(data.date).toISOString(),
        payee: data.payee,
        attachments: [uploadResult.id],
        voucherNo: data.voucherNo ? data.voucherNo : undefined,
        notes: data.notes ? data.notes : undefined,
      });

      toast.success("Expense recorded successfully!", {
        description: `Disbursement of ৳${data.amountMajor} submitted.`,
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof CreateExpenseFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Failed to record expense", {
            description: err.message,
          });
        }
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setIsUploadingFile(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Mosque Expense"
      description="Record a disbursement with compulsory invoice or bill attachment."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Expense Amount (৳ BDT) <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("amountMajor")}
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 1500.00"
              disabled={isSubmitting}
            />
            {errors.amountMajor && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.amountMajor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Expense Date <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("date")}
              type="date"
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Payee & Voucher Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Payee / Vendor Name <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("payee")}
              placeholder="e.g. Dhaka Electric / Sheikh Abdullah"
              disabled={isSubmitting}
            />
            {errors.payee && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.payee.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Voucher / Bill Number (Optional)
            </label>
            <Input
              {...register("voucherNo")}
              placeholder="e.g. BILL-2025-09"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Account & Fund */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Disbursed From Account <span className="text-destructive">*</span>
            </label>
            <select
              {...register("accountId")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toLowerCase()})
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.accountId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Charged to Fund <span className="text-destructive">*</span>
            </label>
            <select
              {...register("fundId")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              {funds?.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name} {fund.isRestricted ? "(Restricted)" : ""}
                </option>
              ))}
            </select>
            {errors.fundId && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.fundId.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Expense Category <span className="text-destructive">*</span>
          </label>
          <select
            {...register("categoryId")}
            disabled={isSubmitting}
            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
          >
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Bill / Invoice Attachment (Required by backend) */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Bill / Receipt Attachment <span className="text-destructive">* (Mandatory)</span>
          </label>
          {selectedFile ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-primary/30 bg-secondary/30 text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium text-foreground truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:text-destructive text-muted-foreground"
                disabled={isSubmitting}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                disabled={isSubmitting}
              />
              <UploadCloud className="w-6 h-6 text-muted-foreground mx-auto mb-1 opacity-70" />
              <p className="text-xs font-medium text-foreground">Upload receipt or invoice</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP, or PDF up to 5MB</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Notes / Description (Optional)
          </label>
          <Input
            {...register("notes")}
            placeholder="Details or reason for expenditure"
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                {isUploadingFile ? "Uploading receipt..." : "Saving expense..."}
              </>
            ) : (
              "Record Expense"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

