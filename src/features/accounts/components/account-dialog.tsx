"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { accountSchema, AccountFormData } from "../validation";
import { AccountItem } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";
import { majorToPoisha, poishaToMajor } from "@/lib/money";
import { Loader2 } from "lucide-react";

interface AccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  initialData?: AccountItem | null;
  onSuccess: () => void;
}

export function AccountDialog({
  isOpen,
  onClose,
  mosqueId,
  initialData,
  onSuccess,
}: AccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!initialData;

  const { data: funds = [] } = useQuery({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
    enabled: isOpen && !isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: "",
      type: "BANK",
      accountNumber: "",
      openingBalanceMajor: "0",
      openingFundId: "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        accountNumber: initialData.accountNumber || "",
        openingBalanceMajor: poishaToMajor(initialData.openingBalance || "0"),
        openingFundId: "",
      });
    } else {
      const defaultFund = funds.find((f: any) => f.type === "GENERAL") || funds[0];
      reset({
        name: "",
        type: "BANK",
        accountNumber: "",
        openingBalanceMajor: "0",
        openingFundId: defaultFund?.id || "",
      });
    }
  }, [initialData, reset, isOpen, funds]);

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true);
    try {
      const openingBalancePoisha = majorToPoisha(data.openingBalanceMajor || "0");

      if (isEditing) {
        await apiClient.patch(`/mosques/${mosqueId}/accounts/${initialData.id}`, {
          name: data.name,
          type: data.type,
          accountNumber: data.accountNumber ? data.accountNumber : null,
        });
        toast.success("Account updated successfully");
      } else {
        await apiClient.post(`/mosques/${mosqueId}/accounts`, {
          name: data.name,
          type: data.type,
          accountNumber: data.accountNumber ? data.accountNumber : undefined,
          openingBalance: openingBalancePoisha,
          openingFundId:
            BigInt(openingBalancePoisha) > 0n && data.openingFundId
              ? data.openingFundId
              : undefined,
        });
        toast.success("Account created successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          err.details.forEach((issue) => {
            const field = issue.field as keyof AccountFormData;
            setError(field, { message: issue.issue });
          });
        } else {
          toast.error("Operation failed", {
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
      title={isEditing ? "Edit Account" : "Add Physical / Bank Account"}
      description="Record where physical funds are held: bank accounts, cash in hand, or mobile wallets."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Account Name <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Islami Bank Main Account or Mosque Safe Box"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Account Type
            </label>
            <select
              {...register("type")}
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
            >
              <option value="BANK">Bank Account</option>
              <option value="CASH">Cash / Physical Safe Box</option>
              <option value="MOBILE_WALLET">Mobile Wallet (bKash/Nagad/Rocket)</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="OTHER">Other Medium</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Account / Reference Number (Optional)
            </label>
            <Input
              {...register("accountNumber")}
              placeholder="e.g. 205012345678"
              disabled={isSubmitting}
            />
            {errors.accountNumber && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.accountNumber.message}</p>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Opening Balance (৳ BDT)
              </label>
              <Input
                {...register("openingBalanceMajor")}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Initial balance on system onboarding. Locked once transactions are recorded.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Fund Allocation
              </label>
              <select
                {...register("openingFundId")}
                disabled={isSubmitting || funds.length === 0}
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {funds.length === 0 ? (
                  <option value="">No active funds available</option>
                ) : (
                  funds.map((fund: any) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name} ({fund.type})
                    </option>
                  ))
                )}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Select which fund this opening balance belongs to (defaults to General fund).
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Account"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
