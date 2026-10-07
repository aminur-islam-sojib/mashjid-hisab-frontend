import { z } from "zod";

export const fundSchema = z.object({
  name: z.string().min(2, "Fund name must be at least 2 characters").max(100),
  type: z.enum([
    "GENERAL",
    "ZAKAT",
    "SADAQAH",
    "CONSTRUCTION",
    "MADRASA",
    "QURBANI",
    "WAQF",
    "IFTAR",
    "OTHER",
  ]),
  isRestricted: z.boolean().default(false),
  description: z.string().max(500).optional().or(z.literal("")),
  confirmPolicyChange: z.boolean().optional(),
});

export type FundFormData = z.infer<typeof fundSchema>;

