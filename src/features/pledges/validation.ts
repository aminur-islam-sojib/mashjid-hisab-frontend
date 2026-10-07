import { z } from "zod";

export const createPledgeSchema = z
  .object({
    amountMajor: z
      .string()
      .min(1, "Amount is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
      .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
    dueDate: z.string().min(1, "Due date is required"),
    targetType: z.enum(["FUND", "CAMPAIGN"]),
    fundId: z.string().optional(),
    campaignId: z.string().optional(),
    installments: z.number().int().min(1).max(360).default(1),
    isRegisteredMember: z.boolean().default(false),
    memberId: z.string().optional(),
    donorName: z.string().max(100).optional(),
    donorPhone: z.string().max(30).optional(),
    donorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.targetType === "FUND") return Boolean(data.fundId?.trim());
      if (data.targetType === "CAMPAIGN") return Boolean(data.campaignId?.trim());
      return false;
    },
    {
      message: "You must specify either a Fund or a Campaign target",
      path: ["targetType"],
    }
  )
  .refine(
    (data) => {
      if (data.isRegisteredMember) return Boolean(data.memberId?.trim());
      return Boolean(data.donorName?.trim());
    },
    {
      message: "Pledger name is required",
      path: ["donorName"],
    }
  );

export type CreatePledgeValues = z.infer<typeof createPledgeSchema>;

export const cancelPledgeSchema = z.object({
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});

export type CancelPledgeValues = z.infer<typeof cancelPledgeSchema>;

