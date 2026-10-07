"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Receipt, Loader2, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { majorToPoisha, poishaToMajor, formatCurrency } from "@/lib/money";
import {
  recordDuePaymentSchema,
  type RecordDuePaymentValues,
} from "./validation";
import { DueRecord } from "./types";

interface RecordDuePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  due: DueRecord | null;
}

export function RecordDuePaymentDialog({
  isOpen,
  onClose,
  mosqueId,
  due,
}: RecordDuePaymentDialogProps) {
  const queryClient = useQueryClient();

  const remainingPoisha = React.useMemo(() => {
    if (!due) return BigInt(0);
    const total = BigInt(due.amount || "0");
    const paid = BigInt(due.paidAmount || "0");
    const diff = total - paid;
    return diff > BigInt(0) ? diff : BigInt(0);
  }, [due]);

  const defaultAmountMajor = React.useMemo(() => {
    return poishaToMajor(remainingPoisha.toString());
  }, [remainingPoisha]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecordDuePaymentValues>({
    resolver: zodResolver(recordDuePaymentSchema) as any,
    defaultValues: {
      amountMajor: defaultAmountMajor,
      accountId: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      source: "CASH",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (due) {
      reset({
        amountMajor: poishaToMajor(
          (BigInt(due.amount || "0") - BigInt(due.paidAmount || "0")).toString()
        ),
        accountId: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        source: "CASH",
        notes: "",
      });
    }
  }, [due, reset]);

  // Fetch Accounts
  const { data: accounts } = useQuery({
    queryKey: ["accounts", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/accounts`),
    enabled: isOpen,
  });

  // Fetch Income Categories
  const { data: categories } = useQuery({
    queryKey: ["categories", mosqueId, "INCOME"],
    queryFn: () =>
      apiClient.get<any[]>(`/mosques/${mosqueId}/categories?type=INCOME`),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (values: RecordDuePaymentValues) => {
      if (!due) return;
      const paymentPoishaStr = majorToPoisha(values.amountMajor);
      const paymentPoisha = BigInt(paymentPoishaStr);
      if (paymentPoisha > remainingPoisha) {
        throw new Error(
          `Payment amount cannot exceed remaining due of ${formatCurrency(
            remainingPoisha.toString()
          )}`
        );
      }

      return apiClient.post(`/mosques/${mosqueId}/dues/${due.id}/payments`, {
        amount: paymentPoishaStr,
        accountId: values.accountId,
        categoryId: values.categoryId,
        date: new Date(values.date).toISOString(),
        source: values.source,
        notes: values.notes || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Due payment recorded and linked donation created.");
      queryClient.invalidateQueries({ queryKey: ["dues", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dues-summary", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record due payment");
    },
  });

  const onSubmit = (values: RecordDuePaymentValues) => {
    mutation.mutate(values);
  };

  if (!due) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Due Payment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Due Summary Card */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payer</span>
            <span className="font-semibold text-gray-900">
              {due.member?.user?.name || due.family?.name || "Member"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Period & Fund</span>
            <span className="text-gray-800">
              {due.period} • {due.fund?.name || "General Fund"}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-500">Total Invoice</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(due.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Remaining Balance</span>
            <span className="font-bold text-[#006B5B] text-base">
              {formatCurrency(remainingPoisha.toString())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Amount to Pay (BDT) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 500"
              {...register("amountMajor")}
            />
            {errors.amountMajor && (
              <p className="text-xs text-red-600">{errors.amountMajor.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <Input type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-red-600">{errors.date.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Deposit Account <span className="text-red-500">*</span>
            </label>
            <select
              {...register("accountId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="">Select Account</option>
              {accounts?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="text-xs text-red-600">{errors.accountId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="">Select Category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-red-600">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <select
            {...register("source")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="CASH">Cash</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="ROCKET">Rocket</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Notes / Receipt Reference
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="Payment reference, transaction ID, or counter receipt..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
          />
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
            type="submit"
            className="bg-[#006B5B] hover:bg-[#005246] text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording Payment...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
