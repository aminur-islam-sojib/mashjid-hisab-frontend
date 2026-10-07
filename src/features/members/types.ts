import { Role, MembershipStatus } from "@/types/api";

export interface MosqueMemberItem {
  id: string; // membership id
  userId: string;
  mosqueId: string;
  role: Role;
  status: MembershipStatus;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    avatarUrl?: string | null;
  };
}

export interface InviteLinkItem {
  id: string;
  mosqueId: string;
  token?: string; // only present on creation
  role: Role;
  maxUses: number | null;
  useCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

