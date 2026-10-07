"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HeartHandshake, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { majorToPoisha } from "@/lib/money";
import {
  createPledgeSchema,
  type CreatePledgeValues,
} from "./validation";

interface RecordPledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function RecordPledgeDialog({
  isOpen,
  onClose,
  mosqueId,
}: RecordPledgeDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePledgeValues>({
    resolver: zodResolver(createPledgeSchema) as any,
    defaultValues: {
      amountMajor: "",
      dueDate: "",
      targetType: "FUND",
      fundId: "",
      campaignId: "",
      installments: 1,
      isRegisteredMember: false,
      memberId: "",
      donorName: "",
      donorPhone: "",
      donorEmail: "",
      notes: "",
    },
  });

  const targetType = watch("targetType");
  const isRegisteredMember = watch("isRegisteredMember");

  React.useEffect(() => {
    if (isOpen) {
      reset({
        amountMajor: "",
        dueDate: "",
        targetType: "FUND",
        fundId: "",
        campaignId: "",
        installments: 1,
        isRegisteredMember: false,
        memberId: "",
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        notes: "",
      });
    }
  }, [isOpen, reset]);

  // Fetch Funds
  const { data: funds } = useQuery<any[]>({
    queryKey: ["funds", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/funds`),
    enabled: isOpen && targetType === "FUND",
  });

  // Fetch Campaigns
  const { data: campaigns } = useQuery<any[]>({
    queryKey: ["campaigns", mosqueId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/mosques/${mosqueId}/campaigns`);
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: isOpen && targetType === "CAMPAIGN",
  });

  // Fetch Members
  const { data: members } = useQuery<any[]>({
    queryKey: ["members", mosqueId],
    queryFn: () => apiClient.get<any[]>(`/mosques/${mosqueId}/members`),
    enabled: isOpen && isRegisteredMember,
  });

  const mutation = useMutation({
    mutationFn: async (values: CreatePledgeValues) => {
      const payload: Record<string, any> = {
        amount: majorToPoisha(values.amountMajor).toString(),
        dueDate: new Date(values.dueDate).toISOString(),
        installments: values.installments || 1,
        notes: values.notes || undefined,
      };

      if (values.targetType === "FUND") {
        payload.fundId = values.fundId;
      } else {
        payload.campaignId = values.campaignId;
      }

      if (values.isRegisteredMember) {
        payload.memberId = values.memberId;
      } else {
        payload.donorName = values.donorName;
        payload.donorPhone = values.donorPhone || undefined;
        payload.donorEmail = values.donorEmail || undefined;
      }

      return apiClient.post(`/mosques/${mosqueId}/pledges`, payload);
    },
    onSuccess: () => {
      toast.success("Pledge recorded successfully.");
      queryClient.invalidateQueries({ queryKey: ["pledges", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record pledge");
    },
  });

  const onSubmit = (values: CreatePledgeValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Donor Pledge">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg flex items-start space-x-3 text-[#006B5B] text-sm">
          <HeartHandshake className="w-5 h-5 text-[#006B5B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Promise to Donate</p>
            <p className="text-gray-600 text-xs mt-1">
              Pledges track promised financial commitments towards a fund or capital campaign.
              Pledges do not affect ledger balances until donation receipts are posted against them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Pledge Amount (BDT) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 50000"
              {...register("amountMajor")}
            />
            {errors.amountMajor && (
              <p className="text-xs text-red-600">{errors.amountMajor.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Promise Due Date <span className="text-red-500">*</span>
            </label>
            <Input type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-xs text-red-600">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        {/* Target Destination */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
            Pledge Target <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                value="FUND"
                {...register("targetType")}
                className="text-[#006B5B] focus:ring-[#006B5B]"
              />
              <span>Specific Fund</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                value="CAMPAIGN"
                {...register("targetType")}
                className="text-[#006B5B] focus:ring-[#006B5B]"
              />
              <span>Special Campaign</span>
            </label>
          </div>

          {targetType === "FUND" ? (
            <div className="space-y-1">
              <select
                {...register("fundId")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="">Select Fund</option>
                {funds?.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <select
                {...register("campaignId")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="">Select Campaign</option>
                {campaigns?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pledger Information */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Donor Information <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                {...register("isRegisteredMember")}
                className="rounded text-[#006B5B] focus:ring-[#006B5B]"
              />
              <span>Registered Mosque Member</span>
            </label>
          </div>

          {isRegisteredMember ? (
            <div className="space-y-1">
              <select
                {...register("memberId")}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                <option value="">Select Member</option>
                {members?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.user?.name || "Member"} {m.user?.phone ? `(${m.user.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Input placeholder="Donor Full Name" {...register("donorName")} />
                {errors.donorName && (
                  <p className="text-xs text-red-600">{errors.donorName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Phone Number" {...register("donorPhone")} />
                <Input placeholder="Email (optional)" {...register("donorEmail")} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1 pt-2 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Notes / Intent
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="e.g. Promised during Friday Jummah appeal..."
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
                Recording Pledge...
              </>
            ) : (
              "Save Pledge"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
