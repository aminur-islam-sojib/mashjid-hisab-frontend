import { z } from "zod";

export const createExpenseSchema = z.object({
  amountMajor: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num > 0;
    }, "Amount must be a positive number"),
  accountId: z.string().min(1, "Disbursement account is required"),
  fundId: z.string().min(1, "Charged fund is required"),
  categoryId: z.string().min(1, "Expense category is required"),
  date: z.string().min(1, "Date is required"),
  payee: z.string().min(2, "Payee / Vendor name is required").max(200),
  voucherNo: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

export const voidExpenseSchema = z.object({
  reason: z.string().min(3, "Void reason must be at least 3 characters").max(500),
});

export type VoidExpenseFormData = z.infer<typeof voidExpenseSchema>;

