"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import {
  createInviteLinkSchema,
  type CreateInviteLinkValues,
} from "./validation";

interface GenerateInviteLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
}

export function GenerateInviteLinkDialog({
  isOpen,
  onClose,
  mosqueId,
}: GenerateInviteLinkDialogProps) {
  const queryClient = useQueryClient();
  const [createdUrl, setCreatedUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInviteLinkValues>({
    resolver: zodResolver(createInviteLinkSchema),
    defaultValues: {
      maxUses: "",
      expiresAt: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ maxUses: "", expiresAt: "" });
      setCreatedUrl(null);
      setCopied(false);
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (values: CreateInviteLinkValues) => {
      const payload: Record<string, any> = {
        role: "MEMBER",
      };
      if (values.maxUses && values.maxUses.trim()) {
        payload.maxUses = parseInt(values.maxUses, 10);
      }
      if (values.expiresAt) {
        payload.expiresAt = new Date(values.expiresAt).toISOString();
      }

      const res = await apiClient.post<any>(
        `/mosques/${mosqueId}/invite-links`,
        payload
      );
      return res;
    },
    onSuccess: (res: any) => {
      toast.success("Invite link generated successfully.");
      queryClient.invalidateQueries({ queryKey: ["invite-links", mosqueId] });

      const token = res?.data?.token;
      if (token) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setCreatedUrl(`${origin}/join/${token}`);
      } else {
        onClose();
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate invite link");
    },
  });

  const onSubmit = (values: CreateInviteLinkValues) => {
    mutation.mutate(values);
  };

  const handleCopy = () => {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Shareable Invite Link">
      {createdUrl ? (
        <div className="space-y-4">
          <div className="p-4 bg-[#E6F4F0] border border-[#006B5B]/30 rounded-xl space-y-2">
            <span className="text-xs font-bold text-[#006B5B] uppercase tracking-wider block">
              Shareable Link Created
            </span>
            <p className="text-xs text-gray-600">
              Anyone with this link can register and join this mosque as a MEMBER.
              This token is displayed only once.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                readOnly
                value={createdUrl}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono text-gray-800 select-all"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className="bg-[#006B5B] hover:bg-[#005246] text-white shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
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
              Max Usages (Optional)
            </label>
            <Input
              type="number"
              placeholder="Leave blank for unlimited"
              {...register("maxUses")}
            />
            {errors.maxUses && (
              <p className="text-xs text-red-600">{errors.maxUses.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Expiration Date (Optional)
            </label>
            <Input type="datetime-local" {...register("expiresAt")} />
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
                  Generating...
                </>
              ) : (
                "Generate Link"
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

