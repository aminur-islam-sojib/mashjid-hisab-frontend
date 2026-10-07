import { z } from "zod";

export const inviteMemberSchema = z
  .object({
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Phone must be 7-15 digits")
      .optional()
      .or(z.literal("")),
    role: z.enum([
      "MOSQUE_ADMIN",
      "TREASURER",
      "COMMITTEE_MEMBER",
      "STAFF",
      "MEMBER",
    ]),
  })
  .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
    message: "At least one contact method (email or phone) is required",
    path: ["email"],
  });

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

export const directCreateMemberSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Phone must be 7-15 digits")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Must contain at least 1 digit")
      .optional()
      .or(z.literal("")),
    role: z.enum([
      "MOSQUE_ADMIN",
      "TREASURER",
      "COMMITTEE_MEMBER",
      "STAFF",
      "MEMBER",
    ]),
  })
  .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
    message: "At least one contact method (email or phone) is required",
    path: ["email"],
  });

export type DirectCreateMemberValues = z.infer<
  typeof directCreateMemberSchema
>;

export const updateRoleSchema = z.object({
  role: z.enum([
    "MOSQUE_ADMIN",
    "TREASURER",
    "COMMITTEE_MEMBER",
    "STAFF",
    "MEMBER",
  ]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type UpdateRoleValues = z.infer<typeof updateRoleSchema>;

export const createInviteLinkSchema = z.object({
  maxUses: z
    .string()
    .optional()
    .refine((val) => !val || /^[1-9]\d*$/.test(val), "Must be a positive integer"),
  expiresAt: z.string().optional(),
});

export type CreateInviteLinkValues = z.infer<typeof createInviteLinkSchema>;

