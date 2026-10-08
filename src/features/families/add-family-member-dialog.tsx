"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  familyMemberSchema,
  type FamilyMemberValues,
} from "./validation";
import { FamilyRecord } from "./types";

interface AddFamilyMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  family: FamilyRecord | null;
  onSuccess?: () => void;
}

export function AddFamilyMemberDialog({
  isOpen,
  onClose,
  mosqueId,
  family,
  onSuccess,
}: AddFamilyMemberDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyMemberValues>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: "",
      relation: "SPOUSE",
      gender: "Male",
      phone: "",
      dateOfBirth: "",
      occupation: "",
      bloodGroup: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        relation: "SPOUSE",
        gender: "Male",
        phone: "",
        dateOfBirth: "",
        occupation: "",
        bloodGroup: "",
      });
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FamilyMemberValues) => {
      if (!family) return;
      const payload: Record<string, any> = {
        name: values.name.trim(),
        relation: values.relation,
      };
      if (values.gender?.trim()) payload.gender = values.gender.trim();
      if (values.phone?.trim()) payload.phone = values.phone.trim();
      if (values.dateOfBirth?.trim()) {
        const parsed = new Date(values.dateOfBirth.trim());
        if (!Number.isNaN(parsed.getTime())) {
          payload.dateOfBirth = parsed.toISOString();
        }
      }
      if (values.occupation?.trim()) payload.occupation = values.occupation.trim();
      if (values.bloodGroup?.trim()) payload.bloodGroup = values.bloodGroup.trim();

      return apiClient.post(
        `/mosques/${mosqueId}/families/${family.id}/members`,
        payload
      );
    },
    onSuccess: () => {
      toast.success("Family member added.");
      queryClient.invalidateQueries({ queryKey: ["families", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["family-detail", mosqueId, family?.id] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add family member");
    },
  });

  const onSubmit = (values: FamilyMemberValues) => {
    mutation.mutate(values);
  };

  if (!family) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Member: ${family.name}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input placeholder="e.g. Fatima Begum" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Relation to Head <span className="text-red-500">*</span>
            </label>
            <select
              {...register("relation")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="SPOUSE">Spouse</option>
              <option value="SON">Son</option>
              <option value="DAUGHTER">Daughter</option>
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="SIBLING">Sibling</option>
              <option value="GRANDPARENT">Grandparent</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Gender
            </label>
            <select
              {...register("gender")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Date of Birth
            </label>
            <Input type="date" {...register("dateOfBirth")} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Blood Group
            </label>
            <Input placeholder="e.g. O+, A+, B-" {...register("bloodGroup")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Phone Number
            </label>
            <Input placeholder="+8801700000000" {...register("phone")} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Occupation
            </label>
            <Input placeholder="e.g. Student, Teacher" {...register("occupation")} />
          </div>
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
                Adding Member...
              </>
            ) : (
              "Add to Family"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

