"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Home, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { familySchema, type FamilyValues } from "./validation";

interface FamilyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function FamilyDialog({
  isOpen,
  onClose,
  mosqueId,
}: FamilyDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ name: "", address: "" });
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FamilyValues) => {
      return apiClient.post(`/mosques/${mosqueId}/families`, {
        name: values.name,
        address: values.address || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Family household registered.");
      queryClient.invalidateQueries({ queryKey: ["families", mosqueId] });
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

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Family / Household Name <span className="text-red-500">*</span>
          </label>
          <Input placeholder="e.g. Rahim Chowdhury Household" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Residential Address
          </label>
          <Input placeholder="e.g. Road 12, Block D, Mirpur" {...register("address")} />
          {errors.address && (
            <p className="text-xs text-red-600">{errors.address.message}</p>
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

