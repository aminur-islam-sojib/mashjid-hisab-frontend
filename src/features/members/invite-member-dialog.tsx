"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Phone, Send, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  inviteMemberSchema,
  type InviteMemberValues,
} from "./validation";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function InviteMemberDialog({
  isOpen,
  onClose,
  mosqueId,
}: InviteMemberDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      phone: "",
      role: "MEMBER",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ email: "", phone: "", role: "MEMBER" });
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: InviteMemberValues) => {
      const payload: Record<string, any> = {
        role: values.role,
      };
      if (values.email?.trim()) payload.email = values.email.trim();
      if (values.phone?.trim()) payload.phone = values.phone.trim();

      return apiClient.post(`/mosques/${mosqueId}/members/invite`, payload);
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully.");
      queryClient.invalidateQueries({ queryKey: ["members", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send invitation");
    },
  });

  const onSubmit = (values: InviteMemberValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Mosque Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg text-[#006B5B] text-xs">
          An invitation link will be dispatched to the provided email or phone number.
          The recipient can accept the invite and join the mosque workspace.
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="member@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Phone Number
          </label>
          <Input
            placeholder="+8801700000000"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Assigned Role <span className="text-red-500">*</span>
          </label>
          <select
            {...register("role")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="MEMBER">Member (Regular Congregator)</option>
            <option value="STAFF">Staff (Cashier / Operations)</option>
            <option value="COMMITTEE_MEMBER">Committee Member (Auditor)</option>
            <option value="TREASURER">Treasurer (Finance Approver)</option>
            <option value="MOSQUE_ADMIN">Mosque Administrator (Full Control)</option>
          </select>
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
                Sending Invite...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

