"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { familySchema, type FamilyValues } from "./validation";
import { MosqueMemberItem } from "../members/types";

interface FamilyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  defaultHeadMembershipId?: string;
}

export function FamilyDialog({
  isOpen,
  onClose,
  mosqueId,
  defaultHeadMembershipId,
}: FamilyDialogProps) {
  const queryClient = useQueryClient();

  // Fetch mosque members for Head of Household selection
  const { data: members = [] } = useQuery<MosqueMemberItem[]>({
    queryKey: ["members", mosqueId],
    queryFn: () => apiClient.get<MosqueMemberItem[]>(`/mosques/${mosqueId}/members`),
    enabled: isOpen && Boolean(mosqueId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FamilyValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: "",
      address: "",
      headMembershipId: defaultHeadMembershipId || "",
    },
  });

  const currentHeadId = watch("headMembershipId");

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        address: "",
        headMembershipId: defaultHeadMembershipId || "",
      });
    }
  }, [isOpen, reset, defaultHeadMembershipId]);

  // When a head member is selected, if family name is empty, auto-suggest household name
  const handleHeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setValue("headMembershipId", selectedId);
    if (selectedId) {
      const selected = members.find((m) => m.id === selectedId);
      if (selected?.user?.name) {
        setValue("name", `${selected.user.name} Household`);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: FamilyValues) => {
      return apiClient.post(`/mosques/${mosqueId}/families`, {
        name: values.name.trim(),
        address: values.address?.trim() || undefined,
        headMembershipId: values.headMembershipId?.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Family household registered.");
      queryClient.invalidateQueries({ queryKey: ["families", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["members", mosqueId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create family");
    },
  });

  const onSubmit = (values: FamilyValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Family Household">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-[#E6F4F0] border border-[#006B5B]/20 rounded-lg text-[#006B5B] text-xs">
          Registering a family household enables group dues pooling, family-wide giving statements,
          and census tracking for congregation dependents.
        </div>

        {/* Head of Household Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Head of Household (Mosque Member)
          </label>
          <select
            value={currentHeadId}
            onChange={handleHeadChange}
            className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
          >
            <option value="">Current User (Default)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.user?.name} {m.user?.phone ? `(${m.user.phone})` : m.user?.email ? `(${m.user.email})` : ""} — {m.role}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            Select the mosque member who heads this household registry.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Family / Household Name <span className="text-red-500">*</span>
          </label>
          <Input placeholder="e.g. Rahim Chowdhury Household" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Residential Address
          </label>
          <Input placeholder="e.g. Road 12, Block D, Mirpur" {...register("address")} />
          {errors.address && (
            <p className="text-xs text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-border">
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
                Registering...
              </>
            ) : (
              "Register Family"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FamilyDialog;
