"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useAuth } from "@/providers/auth-provider";
import {
  verifyCollectionSchema,
  type VerifyCollectionValues,
} from "./validation";
import { CollectionSession } from "./types";

interface VerifyCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  session: CollectionSession | null;
}

export function VerifyCollectionDialog({
  isOpen,
  onClose,
  mosqueId,
  session,
}: VerifyCollectionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isSelfCounted = Boolean(
    user?.id && session?.createdBy?.id && user.id === session.createdBy.id
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VerifyCollectionValues>({
    resolver: zodResolver(verifyCollectionSchema),
    defaultValues: {
      fundId: session?.fundId || "",
      accountId: session?.accountId || "",
      categoryId: session?.categoryId || "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (session) {
      reset({
        fundId: session.fundId || "",
        accountId: session.accountId || "",
        categoryId: session.categoryId || "",
        notes: "",
      });
    }
  }, [session, reset]);

  // Fetch Accounts, Funds, Categories
  const { data: accounts } = useQuery({
    queryKey: ["accounts", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/accounts`),
    enabled: isOpen,
  });

  const { data: funds } = useQuery({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
    enabled: isOpen,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", mosqueId, "INCOME"],
    queryFn: () =>
      apiClient.get<any[]>(`/mosques/${mosqueId}/categories?type=INCOME`),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (values: VerifyCollectionValues) => {
      if (!session) return;
      return apiClient.post(
        `/mosques/${mosqueId}/collections/${session.id}/verify`,
        {
          fundId: values.fundId,
          accountId: values.accountId,
          categoryId: values.categoryId || undefined,
          notes: values.notes || undefined,
        }
      );
    },
    onSuccess: () => {
      toast.success("Counting session verified and posted as anonymous income.");
      queryClient.invalidateQueries({ queryKey: ["collections", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["funds", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to verify collection session");
    },
  });

  const onSubmit = (values: VerifyCollectionValues) => {
    mutation.mutate(values);
  };

  if (!session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify & Post Counting Session">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isSelfCounted ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3 text-amber-900 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Dual-Control Policy Restriction</p>
              <p className="text-amber-800 text-xs mt-1">
                You performed the initial count for this session. To uphold financial
                transparency, the verifier must be an independent second person
                (Treasurer or Mosque Admin).
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg flex items-start space-x-3 text-[#006B5B] text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#006B5B] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Confirm Cash Count & Post</p>
              <p className="text-gray-600 text-xs mt-1">
                Verifying this session will mark it as VERIFIED and post a corresponding
                anonymous donation entry in the master ledger for the verified amount.
              </p>
            </div>
          </div>
        )}

        {/* Count Summary */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Occasion</span>
            <span className="font-semibold text-gray-900">{session.occasion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Counted Total</span>
            <span className="text-xl font-black text-[#006B5B]">
              {formatCurrency(session.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Counted By</span>
            <span className="text-gray-900 font-medium">
              {session.createdBy?.name || "Staff Officer"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="text-gray-900">
              {new Date(session.date).toLocaleDateString()}
            </span>
          </div>
          {session.notes && (
            <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Initial Count Notes:</span>{" "}
              {session.notes}
            </div>
          )}
        </div>

        {/* Deposit Destination */}
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
              Target Fund <span className="text-red-500">*</span>
            </label>
            <select
              {...register("fundId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="">Select Fund</option>
              {funds?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {errors.fundId && (
              <p className="text-xs text-red-600">{errors.fundId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Income Category
          </label>
          <select
            {...register("categoryId")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="">Select Category (Optional)</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Verification Remarks
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="Verified physical cash count against envelope totals..."
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
            disabled={isSelfCounted || mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Confirm & Post Income"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
