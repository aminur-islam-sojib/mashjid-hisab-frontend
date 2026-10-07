export type CampaignStatus = "ACTIVE" | "CLOSED";

export interface CampaignProgress {
  raisedAmount: string; // poisha
  targetAmount: string | null; // poisha
  progressPercent: number | null;
  donorCount: number;
}

export interface CampaignItem {
  id: string;
  mosqueId: string;
  fundId: string;
  fund: { id: string; name: string };
  title: string;
  description: string | null;
  targetAmount: string | null;
  startDate: string;
  endDate: string | null;
  isPublic: boolean;
  status: CampaignStatus;
  closedAt: string | null;
  closedBy: { id: string; name: string } | null;
  progress: CampaignProgress;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDonorEntry {
  donorLabel: string;
  donorType: "MEMBER" | "FAMILY" | "WALK_IN" | "ANONYMOUS";
  memberId: string | null;
  familyId: string | null;
  totalAmount: string; // poisha
  donationCount: number;
  lastDonationDate: string | null;
}

