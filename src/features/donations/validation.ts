import { z } from "zod";

export const createDonationSchema = z.object({
  amountMajor: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => {
      const num = parseFloat(v);
      return !isNaN(num) && num > 0;
    }, "Amount must be a positive number"),
  accountId: z.string().min(1, "Physical / Bank account is required"),
  fundId: z.string().min(1, "Fund is required"),
  categoryId: z.string().min(1, "Income category is required"),
  date: z.string().min(1, "Date is required"),
  donorName: z.string().max(100).optional().or(z.literal("")),
  donorPhone: z.string().max(30).optional().or(z.literal("")),
  donorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  source: z.enum(["CASH_BOX", "MEMBER", "ONLINE", "BANK"]).default("MEMBER"),
  isAnonymousPublic: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateDonationFormData = z.infer<typeof createDonationSchema>;

export const voidDonationSchema = z.object({
  reason: z.string().min(3, "Void reason must be at least 3 characters").max(500),
});

export type VoidDonationFormData = z.infer<typeof voidDonationSchema>;

