import { z } from "zod";

export const createChandaPlanSchema = z.object({
  amountMajor: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  fundId: z.string().min(1, "Fund is required"),
  frequency: z.enum(["MONTHLY", "YEARLY"]),
  startMonth: z
    .string()
    .min(1, "Start month is required")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format must be YYYY-MM (e.g. 2026-07)"),
  payerType: z.enum(["MEMBER", "FAMILY"]),
  memberId: z.string().optional(),
  familyId: z.string().optional(),
}).refine(
  (data) => {
    if (data.payerType === "MEMBER") return Boolean(data.memberId?.trim());
    if (data.payerType === "FAMILY") return Boolean(data.familyId?.trim());
    return false;
  },
  {
    message: "You must select a payer (Member or Family)",
    path: ["payerType"],
  }
);

export type CreateChandaPlanValues = z.infer<typeof createChandaPlanSchema>;

export const generateDuesSchema = z.object({
  period: z
    .string()
    .min(1, "Period is required")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format must be YYYY-MM (e.g. 2026-07)"),
});

export type GenerateDuesValues = z.infer<typeof generateDuesSchema>;

export const recordDuePaymentSchema = z.object({
  amountMajor: z
    .string()
    .min(1, "Payment amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  accountId: z.string().min(1, "Deposit account is required"),
  categoryId: z.string().min(1, "Income category is required"),
  date: z.string().min(1, "Payment date is required"),
  source: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "BKASH",
    "NAGAD",
    "ROCKET",
    "CHEQUE",
    "OTHER",
  ]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type RecordDuePaymentValues = z.infer<typeof recordDuePaymentSchema>;

export const waiveDueSchema = z.object({
  reason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type WaiveDueValues = z.infer<typeof waiveDueSchema>;

