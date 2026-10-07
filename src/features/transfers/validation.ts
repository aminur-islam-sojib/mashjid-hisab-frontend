import { z } from "zod";

export const createTransferSchema = z
  .object({
    amountMajor: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => {
        const num = parseFloat(v);
        return !isNaN(num) && num > 0;
      }, "Amount must be a positive number"),
    fromAccountId: z.string().min(1, "Source account is required"),
    toAccountId: z.string().min(1, "Destination account is required"),
    fromFundId: z.string().min(1, "Source fund is required"),
    toFundId: z.string().optional().or(z.literal("")),
    date: z.string().min(1, "Date is required"),
    isFundTransfer: z.boolean().default(false),
    reason: z.string().optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Source and destination account cannot be identical unless it's a fund transfer
      if (!data.isFundTransfer && data.fromAccountId === data.toAccountId) {
        return false;
      }
      return true;
    },
    {
      message: "Source and destination accounts must be different",
      path: ["toAccountId"],
    }
  )
  .refine(
    (data) => {
      // If it's a fund transfer, reason is required and toFundId must be different from fromFundId
      if (data.isFundTransfer) {
        return !!data.reason && data.reason.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Audit reason is required for fund-to-fund transfers (min 3 chars)",
      path: ["reason"],
    }
  )
  .refine(
    (data) => {
      if (data.isFundTransfer) {
        return !!data.toFundId && data.toFundId !== data.fromFundId;
      }
      return true;
    },
    {
      message: "Destination fund must be different from source fund",
      path: ["toFundId"],
    }
  );

export type CreateTransferFormData = z.infer<typeof createTransferSchema>;

export const voidTransferSchema = z.object({
  reason: z.string().min(3, "Void reason must be at least 3 characters").max(500),
});

export type VoidTransferFormData = z.infer<typeof voidTransferSchema>;

