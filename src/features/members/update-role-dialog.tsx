"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import {
  updateRoleSchema,
  type UpdateRoleValues,
} from "./validation";
import { MosqueMemberItem } from "./types";

interface UpdateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  member: MosqueMemberItem | null;
}

export function UpdateRoleDialog({
  isOpen,
  onClose,
  mosqueId,
  member,
}: UpdateRoleDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateRoleValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      role: (member?.role as any) || "MEMBER",
      status: (member?.status as any) || "ACTIVE",
    },
  });

  React.useEffect(() => {
    if (member) {
      reset({
        role: member.role as any,
        status: member.status as any,
      });
    }
  }, [member, reset]);

  const mutation = useMutation({
    mutationFn: async (values: UpdateRoleValues) => {
      if (!member) return;
      return apiClient.patch(
        `/mosques/${mosqueId}/members/${member.id}`,
        values
      );
    },
    onSuccess: () => {
      toast.success("Member role updated.");
      queryClient.invalidateQueries({ queryKey: ["members", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update member role");
    },
  });

  const onSubmit = (values: UpdateRoleValues) => {
    mutation.mutate(values);
  };

  if (!member) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Role: ${member.user.name}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Mosque Role <span className="text-red-500">*</span>
          </label>
          <select
            {...register("role")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="MEMBER">Member (Regular)</option>
            <option value="STAFF">Staff (Cashier / Operations)</option>
            <option value="COMMITTEE_MEMBER">Committee Member (Auditor)</option>
            <option value="TREASURER">Treasurer (Finance Approver)</option>
            <option value="MOSQUE_ADMIN">Mosque Administrator</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Membership Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive / Suspended</option>
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

