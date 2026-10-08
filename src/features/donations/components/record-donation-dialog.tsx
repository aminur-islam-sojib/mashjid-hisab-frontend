"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDonationSchema, CreateDonationFormData } from "../validation";
import { FundItem } from "@/features/funds/types";
import { AccountItem } from "@/features/accounts/types";
import { CategoryItem } from "@/features/categories/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { majorToPoisha } from "@/lib/money";
import { Loader2 } from "lucide-react";

interface RecordDonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  funds?: FundItem[];
  accounts?: AccountItem[];
  categories?: CategoryItem[];
  onSuccess: () => void;
}

export function RecordDonationDialog({
  isOpen,
  onClose,
  mosqueId,
  funds,
  accounts,
  categories,
  onSuccess,
}: RecordDonationDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const prevIsOpenRef = React.useRef(false);

  const incomeCategories = React.useMemo(() => {
    return categories?.filter((c) => c.type === "INCOME") || [];
  }, [categories]);

  const todayStr = new Date().toISOString().split("T")[0]!;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateDonationFormData>({
    resolver: zodResolver(createDonationSchema) as any,
    defaultValues: {
      amountMajor: "",
      accountId: accounts?.[0]?.id || "",
      fundId: funds?.[0]?.id || "",
      categoryId: incomeCategories?.[0]?.id || "",
      date: todayStr,
      donorName: "",
      donorPhone: "",
      donorEmail: "",
      source: "MEMBER",
      isAnonymousPublic: false,
      notes: "",
    },
  });

  const selectedFundId = watch("fundId");

  const selectedFund = React.useMemo(() => {
    return funds?.find((f) => f.id === selectedFundId);
  }, [funds, selectedFundId]);

  const filteredCategories = React.useMemo(() => {
    if (!selectedFund) return incomeCategories;
    if (selectedFund.isRestricted) {
      // Backend invariant: restricted funds require a category specifically allocated to them
      return incomeCategories.filter((c) => c.fundId === selectedFundId);
    }
    return incomeCategories.filter(
      (c) => !c.fundId || c.fundId === selectedFundId
    );
  }, [incomeCategories, selectedFund, selectedFundId]);

  const currentCategoryId = watch("categoryId");

  // Reset form ONLY when dialog opens, preserving inputs during fund selection
  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const initialFundId = funds?.[0]?.id || "";
      const initialFund = funds?.[0];
      const initialCats = initialFund?.isRestricted
        ? incomeCategories.filter((c) => c.fundId === initialFundId)
        : incomeCategories.filter((c) => !c.fundId || c.fundId === initialFundId);

      reset({
        amountMajor: "",
        accountId: accounts?.[0]?.id || "",
        fundId: initialFundId,
        categoryId: initialCats?.[0]?.id || "",
        date: todayStr,
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        source: "MEMBER",
        isAnonymousPublic: false,
        notes: "",
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, accounts, funds, incomeCategories, reset, todayStr]);

  // Adjust category when selected fund changes without resetting other fields
  React.useEffect(() => {
    if (!isOpen) return;
    const isValid = filteredCategories.some((c) => c.id === currentCategoryId);
    if (!isValid) {
      setValue("categoryId", filteredCategories[0]?.id || "");
    }
  }, [filteredCategories, currentCategoryId, setValue, isOpen]);

  const onSubmit = async (data: CreateDonationFormData) => {
    setIsSubmitting(true);
    try {
      const amountPoisha = majorToPoisha(data.amountMajor);

      await apiClient.post(`/mosques/${mosqueId}/donations`, {
        amount: amountPoisha,
        accountId: data.accountId,
        fundId: data.fundId,
        categoryId: data.categoryId,
        date: new Date(data.date).toISOString(),
        donorName: data.donorName ? data.donorName : undefined,
        donorPhone: data.donorPhone ? data.donorPhone : undefined,
        donorEmail: data.donorEmail ? data.donorEmail : undefined,
        source: data.source,
        isAnonymousPublic: data.isAnonymousPublic,
        notes: data.notes ? data.notes : undefined,
      });

      toast.success("Donation recorded successfully!", {
        description: `৳${data.amountMajor} received and posted to ledger.`,
      });

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details) && err.details.length > 0) {
          err.details.forEach((issue) => {
            const field = (
              issue.field === "amount" ? "amountMajor" : issue.field
            ) as keyof CreateDonationFormData;
            setError(field, { message: issue.issue });
          });
          toast.error("Validation error", {
            description: err.details[0]?.issue || err.message,
          });
        } else {
          toast.error("Failed to record donation", {
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
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Donation / Sadaqah"
      description="Record an income collection for a specific fund and depository account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Amount (৳ BDT) <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("amountMajor")}
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 500.00"
              disabled={isSubmitting}
            />
            {errors.amountMajor && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.amountMajor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Date Received <span className="text-destructive">*</span>
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

        {/* Account & Fund */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Depository Account <span className="text-destructive">*</span>
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
              Target Fund <span className="text-destructive">*</span>
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

        {/* Category & Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Income Category <span className="text-destructive">*</span>
            </label>
            <select
              {...register("categoryId")}
              disabled={isSubmitting || filteredCategories.length === 0}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs disabled:opacity-50"
            >
              {filteredCategories.length === 0 ? (
                <option value="">No income category for this fund</option>
              ) : (
                filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            {filteredCategories.length === 0 && selectedFund?.isRestricted && (
              <p className="text-[11px] text-amber-600 mt-1 font-medium">
                Restricted funds require an income category specifically allocated to them.
              </p>
            )}
            {errors.categoryId && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Collection Source
            </label>
            <select
              {...register("source")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              <option value="MEMBER">Member / Community Individual</option>
              <option value="CASH_BOX">Mosque Donation Box</option>
              <option value="ONLINE">Online Portal / Transfer</option>
              <option value="BANK">Direct Bank Deposit</option>
            </select>
          </div>
        </div>

        {/* Donor Information */}
        <div className="pt-2 border-t border-border/80">
          <p className="text-xs font-semibold text-foreground mb-2">Donor Information (Optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <Input
                {...register("donorName")}
                placeholder="Donor Name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Input
                {...register("donorPhone")}
                placeholder="Phone Number"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Input
                {...register("donorEmail")}
                type="email"
                placeholder="Email Address"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Anonymous flag */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/40 border border-border/80">
          <input
            {...register("isAnonymousPublic")}
            type="checkbox"
            id="isAnon"
            className="w-4 h-4 rounded text-primary"
            disabled={isSubmitting}
          />
          <label htmlFor="isAnon" className="text-xs font-medium text-foreground cursor-pointer">
            Hide donor identity on public feeds (Mask as &quot;Anonymous&quot;)
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Notes / Reference (Optional)
          </label>
          <Input
            {...register("notes")}
            placeholder="e.g. Received after Maghrib prayer"
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
                Posting entry...
              </>
            ) : (
              "Post Donation"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
