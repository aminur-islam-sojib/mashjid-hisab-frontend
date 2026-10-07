"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Coins, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { majorToPoisha } from "@/lib/money";
import {
  createCollectionSchema,
  type CreateCollectionValues,
} from "./validation";

interface StartCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function StartCollectionDialog({
  isOpen,
  onClose,
  mosqueId,
}: StartCollectionDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCollectionValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      occasion: "JUMMAH",
      date: new Date().toISOString().split("T")[0],
      amountMajor: "",
      fundId: "",
      accountId: "",
      categoryId: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        occasion: "JUMMAH",
        date: new Date().toISOString().split("T")[0],
        amountMajor: "",
        fundId: "",
        accountId: "",
        categoryId: "",
        notes: "",
      });
    }
  }, [isOpen, reset]);

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
    mutationFn: async (values: CreateCollectionValues) => {
      const payload: Record<string, any> = {
        occasion: values.occasion,
        date: new Date(values.date).toISOString(),
        totalAmount: majorToPoisha(values.amountMajor).toString(),
        notes: values.notes || undefined,
        fundId: values.fundId || undefined,
        accountId: values.accountId || undefined,
        categoryId: values.categoryId || undefined,
      };

      return apiClient.post(`/mosques/${mosqueId}/collections`, payload);
    },
    onSuccess: () => {
      toast.success("Counting session created successfully.");
      queryClient.invalidateQueries({ queryKey: ["collections", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to start collection session");
    },
  });

  const onSubmit = (values: CreateCollectionValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Counting Session">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg flex items-start space-x-3 text-[#006B5B] text-sm">
          <Coins className="w-5 h-5 text-[#006B5B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Dual-Control Cash Counting</p>
            <p className="text-gray-600 text-xs mt-1">
              Enter the total cash counted from the collection box or event. The session will
              remain OPEN until an independent verifier confirms the count and posts the income.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Occasion / Event <span className="text-red-500">*</span>
            </label>
            <select
              {...register("occasion")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="JUMMAH">Jummah Prayer Collection</option>
              <option value="EID">Eid Prayer Collection</option>
              <option value="TARAWEEH">Taraweeh / Ramadan Collection</option>
              <option value="DONATION_BOX">Permanent Donation Box</option>
              <option value="FUNDRAISER">Fundraising Event</option>
              <option value="SPECIAL">Special Occasion</option>
            </select>
            {errors.occasion && (
              <p className="text-xs text-red-600">{errors.occasion.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Counting Date <span className="text-red-500">*</span>
            </label>
            <Input type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-red-600">{errors.date.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Total Cash Counted (BDT) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 25000"
            {...register("amountMajor")}
          />
          {errors.amountMajor && (
            <p className="text-xs text-red-600">{errors.amountMajor.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Deposit Account
            </label>
            <select
              {...register("accountId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="">Select Account (Optional)</option>
              {accounts?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Target Fund
            </label>
            <select
              {...register("fundId")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="">Select Fund (Optional)</option>
              {funds?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
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
            Notes / Denomination Breakdown
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="e.g. 1000x20, 500x10, counted by Brother X and Y"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] resize-none"
          />
          {errors.notes && (
            <p className="text-xs text-red-600">{errors.notes.message}</p>
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
            type="submit"
            className="bg-[#006B5B] hover:bg-[#005246] text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording Session...
              </>
            ) : (
              "Submit Session"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
