import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2, "Account name must be at least 2 characters").max(100),
  type: z.enum(["CASH", "BANK", "MOBILE_WALLET", "CARD", "OTHER"]),
  accountNumber: z.string().max(50).optional().or(z.literal("")),
  openingBalanceMajor: z.string().default("0"),
});

export type AccountFormData = z.infer<typeof accountSchema>;

export const reconciliationSchema = z.object({
  realBalanceMajor: z.string().min(1, "Actual physical/bank balance is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
  fundId: z.string().optional().or(z.literal("")),
});

export type ReconciliationFormData = z.infer<typeof reconciliationSchema>;

