"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserPlus, Loader2, KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  directCreateMemberSchema,
  type DirectCreateMemberValues,
} from "./validation";

interface DirectCreateMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function DirectCreateMemberDialog({
  isOpen,
  onClose,
  mosqueId,
}: DirectCreateMemberDialogProps) {
  const queryClient = useQueryClient();
  const [createdCredentials, setCreatedCredentials] = React.useState<{
    email?: string;
    phone?: string;
    temporaryPassword?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DirectCreateMemberValues>({
    resolver: zodResolver(directCreateMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "MEMBER",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ name: "", email: "", phone: "", password: "", role: "MEMBER" });
      setCreatedCredentials(null);
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: DirectCreateMemberValues) => {
      const payload: Record<string, any> = {
        name: values.name,
        role: values.role,
      };
      if (values.email?.trim()) payload.email = values.email.trim();
      if (values.phone?.trim()) payload.phone = values.phone.trim();
      if (values.password?.trim()) payload.password = values.password.trim();

      const res = await apiClient.post<any>(
        `/mosques/${mosqueId}/members/direct`,
        payload
      );
      return res;
    },
    onSuccess: (res: any) => {
      toast.success("Member account created directly.");
      queryClient.invalidateQueries({ queryKey: ["members", mosqueId] });

      if (res?.data?.temporaryPassword) {
        setCreatedCredentials({
          email: res.data.email,
          phone: res.data.phone,
          temporaryPassword: res.data.temporaryPassword,
        });
      } else {
        onClose();
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create member account");
    },
  });

  const onSubmit = (values: DirectCreateMemberValues) => {
    mutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Directly Register Mosque Member">
      {createdCredentials ? (
        <div className="space-y-4">
          <div className="p-4 bg-[#E6F4F0] border border-[#006B5B]/30 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-[#006B5B] font-bold">
              <KeyRound className="w-5 h-5" />
              <span>Temporary Account Credentials</span>
            </div>
            <p className="text-xs text-gray-600">
              Please share these credentials with the member. On their first login, they will be
              prompted to set a new personal password.
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-xs space-y-1 mt-2">
              {createdCredentials.email && (
                <div>
                  <span className="text-gray-400">Login Email:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {createdCredentials.email}
                  </span>
                </div>
              )}
              {createdCredentials.phone && (
                <div>
                  <span className="text-gray-400">Login Phone:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {createdCredentials.phone}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Temporary Password:</span>{" "}
                <span className="font-bold text-[#006B5B]">
                  {createdCredentials.temporaryPassword}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              className="bg-[#006B5B] hover:bg-[#005246] text-white"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input placeholder="e.g. Mohammad Rahim" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="rahim@example.com"
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
              <Input placeholder="+8801700000000" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Temporary Password (Optional)
              </label>
              <Input
                type="password"
                placeholder="Auto-generated if empty"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
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
                <option value="MEMBER">Member</option>
                <option value="STAFF">Staff</option>
                <option value="COMMITTEE_MEMBER">Committee Member</option>
                <option value="TREASURER">Treasurer</option>
                <option value="MOSQUE_ADMIN">Mosque Administrator</option>
              </select>
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
                  Creating Account...
                </>
              ) : (
                "Create Member"
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

