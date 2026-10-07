import { Role, MembershipStatus, UserStatus } from "./api";

export interface UserProfile {
  id?: string;
  address?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  locale?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  locale?: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  status: UserStatus;
  role: Role | null;
  profile?: UserProfile | null;
}

export interface MosqueBasic {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  timezone?: string;
  fiscalYearStart?: number;
  isTransparencyPageEnabled?: boolean;
}

export interface UserMembership {
  id: string;
  mosqueId: string;
  role: Role;
  status: MembershipStatus;
  mosque: MosqueBasic;
}

export interface AuthMeData {
  user: PublicUser;
  activeMosqueId: string | null;
  role: Role | null;
  memberships: UserMembership[];
}

export interface LoginResponseData {
  user: PublicUser;
  activeMosqueId: string | null;
  role: Role | null;
  accessToken: string;
}

