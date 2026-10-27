"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Banknote,
  Building2,
  Smartphone,
  Coins,
  User,
  Users,
  EyeOff,
  Search,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient, ApiError } from "@/lib/api-client";
import { useIdempotencyKey } from "@/lib/idempotency";
import { majorToPoisha, formatCurrency } from "@/lib/money";
import { CampaignItem } from "./types";
import { AccountItem } from "@/features/accounts/types";
import { CategoryItem } from "@/features/categories/types";
import { MosqueMemberItem } from "@/features/members/types";

interface RecordCampaignContributionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mosqueId: string;
  campaign: CampaignItem | null;
  onSuccess?: () => void;
}

type ContributorType = "MEMBER" | "GUEST" | "ANONYMOUS";
type PaymentChannel = "CASH" | "ONLINE" | "BANK";

const QUICK_AMOUNTS = ["500", "1000", "2000", "5000", "10000"];

export function RecordCampaignContributionDialog({
  isOpen,
  onClose,
  mosqueId,
  campaign,
  onSuccess,
}: RecordCampaignContributionDialogProps) {
  const queryClient = useQueryClient();
  const { key: idempotencyKey } = useIdempotencyKey(isOpen);

  // 1. Amount
  const [amountMajor, setAmountMajor] = React.useState("");

  // 2. Contributor State
  const [contributorType, setContributorType] = React.useState<ContributorType>("MEMBER");
  const [memberSearchQuery, setMemberSearchQuery] = React.useState("");
  const deferredMemberSearch = React.useDeferredValue(memberSearchQuery);
  const [selectedMemberId, setSelectedMemberId] = React.useState("");
  const [donorName, setDonorName] = React.useState("");
  const [donorPhone, setDonorPhone] = React.useState("");
  const [donorEmail, setDonorEmail] = React.useState("");

  // 3. Payment Method & Allocation
  const [paymentChannel, setPaymentChannel] = React.useState<PaymentChannel>("CASH");
  const [selectedAccountId, setSelectedAccountId] = React.useState("");

  // 4. Collapsible Advanced Details
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);
  const [date, setDate] = React.useState(() => new Date().toISOString().split("T")[0]!);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isAnonymousPublic, setIsAnonymousPublic] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch Accounts (safe array unwrap)
  const { data: rawAccounts } = useQuery<any>({
    queryKey: ["accounts", mosqueId],
    queryFn: () => apiClient.get<any>(`/mosques/${mosqueId}/accounts`),
    enabled: isOpen && Boolean(mosqueId),
  });

  const accounts: AccountItem[] = React.useMemo(() => {
    if (!rawAccounts) return [];
    if (Array.isArray(rawAccounts)) return rawAccounts;
    if (Array.isArray(rawAccounts.data)) return rawAccounts.data;
    if (Array.isArray(rawAccounts.accounts)) return rawAccounts.accounts;
    return [];
  }, [rawAccounts]);

  // Fetch Categories (safe array unwrap)
  const { data: rawCategories } = useQuery<any>({
    queryKey: ["categories", mosqueId],
    queryFn: () => apiClient.get<any>(`/mosques/${mosqueId}/categories`),
    enabled: isOpen && Boolean(mosqueId),
  });

  const categories: CategoryItem[] = React.useMemo(() => {
    if (!rawCategories) return [];
    if (Array.isArray(rawCategories)) return rawCategories;
    if (Array.isArray(rawCategories.data)) return rawCategories.data;
    if (Array.isArray(rawCategories.categories)) return rawCategories.categories;
    return [];
  }, [rawCategories]);

  // Fetch Members (safe array unwrap)
  const { data: rawMembers } = useQuery<any>({
    queryKey: ["members", mosqueId, "ACTIVE"],
    queryFn: () =>
      apiClient.get<any>(`/mosques/${mosqueId}/members?status=ACTIVE`),
    enabled: isOpen && Boolean(mosqueId),
  });

  const members: MosqueMemberItem[] = React.useMemo(() => {
    if (!rawMembers) return [];
    if (Array.isArray(rawMembers)) return rawMembers;
    if (Array.isArray(rawMembers.data)) return rawMembers.data;
    if (Array.isArray(rawMembers.members)) return rawMembers.members;
    return [];
  }, [rawMembers]);

  // Eligible categories filtered to campaign fund
  const eligibleCategories = React.useMemo(() => {
    const incomeCats = categories.filter((c) => c.type === "INCOME" && !c.isArchived);
    if (!campaign?.fundId) return incomeCats;
    return incomeCats.filter((c) => !c.fundId || c.fundId === campaign.fundId);
  }, [categories, campaign?.fundId]);

  // Accounts matching the active payment channel
  const channelAccounts = React.useMemo(() => {
    if (paymentChannel === "CASH") {
      return accounts.filter((a) => a.type === "CASH");
    }
    if (paymentChannel === "ONLINE") {
      return accounts.filter((a) => a.type === "MOBILE_WALLET");
    }
    if (paymentChannel === "BANK") {
      return accounts.filter((a) => a.type === "BANK");
    }
    return accounts;
  }, [accounts, paymentChannel]);

  // Selected member object
  const selectedMember = React.useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Filter members using deferred query for 60fps performance
  const filteredMembers = React.useMemo(() => {
    if (!deferredMemberSearch.trim()) return members;
    const q = deferredMemberSearch.toLowerCase();
    return members.filter((m) => {
      const nameMatch = m.user?.name?.toLowerCase().includes(q);
      const phoneMatch = m.user?.phone?.toLowerCase().includes(q);
      const roleMatch = m.role?.toLowerCase().includes(q);
      return Boolean(nameMatch || phoneMatch || roleMatch);
    });
  }, [members, deferredMemberSearch]);

  // Synchronize payment channel with default account
  const handlePaymentChannelChange = (channel: PaymentChannel) => {
    setPaymentChannel(channel);
    let targetType: string = "CASH";
    if (channel === "ONLINE") targetType = "MOBILE_WALLET";
    if (channel === "BANK") targetType = "BANK";

    const matched = accounts.find((a) => a.type === targetType);
    if (matched) {
      setSelectedAccountId(matched.id);
    } else if (accounts.length > 0) {
      setSelectedAccountId(accounts[0]?.id || "");
    }
  };

  // Set initial account & category defaults
  React.useEffect(() => {
    if (isOpen) {
      if (!selectedAccountId && accounts.length > 0) {
        const cashAcc = accounts.find((a) => a.type === "CASH") || accounts[0];
        if (cashAcc) setSelectedAccountId(cashAcc.id);
      }
      if (!selectedCategoryId && eligibleCategories.length > 0) {
        setSelectedCategoryId(eligibleCategories[0]?.id || "");
      }
    }
  }, [isOpen, accounts, eligibleCategories, selectedAccountId, selectedCategoryId]);

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen) {
      setAmountMajor("");
      setContributorType("MEMBER");
      setMemberSearchQuery("");
      setSelectedMemberId("");
      setDonorName("");
      setDonorPhone("");
      setDonorEmail("");
      setPaymentChannel("CASH");
      setDate(new Date().toISOString().split("T")[0]!);
      setNotes("");
      setIsAnonymousPublic(false);
      setShowMoreDetails(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Real-time progress calculations
  let currentPercent = 0;
  let projectedPercent = 0;
  let additionalPercent = 0;
  const isTargetSet = Boolean(campaign?.targetAmount && BigInt(campaign.targetAmount) > 0n);

  if (isTargetSet && campaign) {
    try {
      const currentRaised = BigInt(campaign.progress?.raisedAmount || "0");
      const target = BigInt(campaign.targetAmount!);
      currentPercent = Math.min(100, Math.round(Number((currentRaised * 10000n) / target) / 100));

      const addition =
        amountMajor && Number(amountMajor) > 0 ? BigInt(majorToPoisha(amountMajor)) : 0n;
      const projectedTotal = currentRaised + addition;
      projectedPercent = Math.min(100, Math.round(Number((projectedTotal * 10000n) / target) / 100));
      additionalPercent = Math.max(0, projectedPercent - currentPercent);
    } catch {
      // Invariant safe
    }
  }

  // Handle amount input changes (clean numbers only)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmountMajor(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign) {
      toast.error("No active campaign selected.");
      return;
    }
    if (!amountMajor || Number(amountMajor) <= 0) {
      toast.error("Please enter a valid contribution amount.");
      return;
    }
    if (!selectedAccountId) {
      toast.error("Please select a deposit account.");
      return;
    }
    if (!selectedCategoryId) {
      toast.error("Please select an income category.");
      return;
    }
    if (contributorType === "MEMBER" && !selectedMemberId) {
      toast.error("Please select a mosque member from the directory.");
      return;
    }
    if (contributorType === "GUEST" && !donorName.trim()) {
      toast.error("Please enter the contributor's name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const amountPoisha = majorToPoisha(amountMajor);
      let donationSource: "MEMBER" | "ONLINE" | "BANK" | "CASH_BOX" = "MEMBER";
      if (paymentChannel === "ONLINE") donationSource = "ONLINE";
      if (paymentChannel === "BANK") donationSource = "BANK";

      const validIsoDate =
        date && !isNaN(Date.parse(date))
          ? new Date(date).toISOString()
          : new Date().toISOString();

      const payload: Record<string, any> = {
        amount: amountPoisha,
        campaignId: campaign.id,
        fundId: campaign.fundId,
        accountId: selectedAccountId,
        categoryId: selectedCategoryId,
        date: validIsoDate,
        source: donationSource,
        isAnonymousPublic: contributorType === "ANONYMOUS" || isAnonymousPublic,
        notes: notes.trim() ? notes.trim() : undefined,
      };

      if (contributorType === "MEMBER" && selectedMemberId) {
        payload.memberId = selectedMemberId;
        if (selectedMember && selectedMember.user) {
          payload.donorName = selectedMember.user.name;
          if (selectedMember.user.phone) payload.donorPhone = selectedMember.user.phone;
          if (selectedMember.user.email) payload.donorEmail = selectedMember.user.email;
        }
      } else if (contributorType === "GUEST") {
        payload.donorName = donorName.trim();
        if (donorPhone.trim()) payload.donorPhone = donorPhone.trim();
        if (donorEmail.trim()) payload.donorEmail = donorEmail.trim();
      } else if (contributorType === "ANONYMOUS") {
        payload.donorName = "Anonymous";
        payload.isAnonymousPublic = true;
      }

      await apiClient.post(`/mosques/${mosqueId}/donations`, payload, {
        idempotencyKey,
      });

      toast.success("Contribution recorded successfully!", {
        description: `৳${Number(amountMajor).toLocaleString()} collected towards ${campaign.title}.`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["campaigns", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-detail", mosqueId, campaign.id] });
      queryClient.invalidateQueries({ queryKey: ["campaign-donors", mosqueId, campaign.id] });
      queryClient.invalidateQueries({ queryKey: ["donations", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", mosqueId] });
      queryClient.invalidateQueries({ queryKey: ["funds", mosqueId] });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        toast.error("Failed to record contribution", {
          description: err.message,
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not open or no campaign, Modal will handle it gracefully without breaking hooks
  if (!isOpen || !campaign) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Campaign Money"
      description={`Collecting towards: ${campaign.title}`}
      size="lg"
      className="max-w-lg w-full !rounded-[14px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Sleek Campaign Progress Context Strip */}
        <div className="bg-muted/40 rounded-[14px] p-3 border border-border/80">
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-foreground truncate">{campaign.title}</span>
              {campaign.fund?.name && (
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 font-medium text-[#006B5B] border-[#006B5B]/30 bg-[#006B5B]/5 rounded-[14px]"
                >
                  {campaign.fund.name}
                </Badge>
              )}
            </div>
            <div className="text-right text-xs shrink-0">
              <span className="font-bold text-[#006B5B]">
                {formatCurrency(campaign.progress?.raisedAmount || "0")}
              </span>
              {campaign.targetAmount && (
                <span className="text-muted-foreground"> / {formatCurrency(campaign.targetAmount)}</span>
              )}
            </div>
          </div>

          {/* Dual Progress Bar Preview */}
          {isTargetSet && (
            <div className="mt-2 space-y-1">
              <div className="w-full bg-muted/80 rounded-[14px] h-2 overflow-hidden flex">
                <div
                  className="bg-[#006B5B] h-2 transition-all duration-300 rounded-[14px]"
                  style={{ width: `${Math.min(currentPercent, 100)}%` }}
                />
                {additionalPercent > 0 && (
                  <div
                    className="bg-emerald-400 dark:bg-emerald-500 h-2 animate-pulse transition-all duration-300 rounded-[14px]"
                    style={{ width: `${Math.min(additionalPercent, 100 - currentPercent)}%` }}
                  />
                )}
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
                <span>
                  {campaign.progress?.donorCount || 0}{" "}
                  {(campaign.progress?.donorCount || 0) === 1 ? "donor" : "donors"} so far
                </span>
                {additionalPercent > 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    +{additionalPercent}% with this gift ({projectedPercent}% goal)
                  </span>
                ) : (
                  <span>{currentPercent}% achieved</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* STEP 1: Hero Amount Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            Amount (BDT) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground pointer-events-none">
              ৳
            </span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0"
              autoFocus
              value={amountMajor}
              onChange={handleAmountChange}
              className="pl-8 pr-9 text-xl font-bold text-foreground h-12 rounded-[14px]"
            />
            {amountMajor && (
              <button
                type="button"
                onClick={() => setAmountMajor("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-[14px] transition-colors"
                aria-label="Clear amount"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tactile Quick Amount Chips with 14px border radius */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {QUICK_AMOUNTS.map((amt) => {
              const isActive = amountMajor === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountMajor(amt)}
                  className={`text-xs px-3 py-1.5 rounded-[14px] border font-medium transition-all ${
                    isActive
                      ? "bg-[#006B5B] text-white border-[#006B5B] font-semibold shadow-xs scale-[1.02]"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  +৳{Number(amt).toLocaleString()}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Contributor Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            Contributor <span className="text-destructive">*</span>
          </label>

          {/* 3-Way Pill Switcher with 14px border radius */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-[14px] border border-border">
            <button
              type="button"
              onClick={() => setContributorType("MEMBER")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[14px] text-xs transition-all ${
                contributorType === "MEMBER"
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#006B5B]" />
              Member
            </button>
            <button
              type="button"
              onClick={() => setContributorType("GUEST")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[14px] text-xs transition-all ${
                contributorType === "GUEST"
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Guest / Walk-in
            </button>
            <button
              type="button"
              onClick={() => setContributorType("ANONYMOUS")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[14px] text-xs transition-all ${
                contributorType === "ANONYMOUS"
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-gray-500" />
              Anonymous
            </button>
          </div>

          {/* Contributor Content: Member */}
          {contributorType === "MEMBER" && (
            <div className="space-y-1.5">
              {selectedMember ? (
                <div className="p-2.5 bg-[#E6F4F0]/50 border border-[#006B5B]/30 rounded-[14px] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[14px] bg-[#006B5B] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {(selectedMember.user?.name || "M").slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {selectedMember.user?.name || "Member"}
                        </span>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 rounded-[14px]">
                          {selectedMember.role}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedMember.user?.phone || "No phone registered"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#006B5B] hover:text-[#005246] hover:bg-[#E6F4F0] h-7 px-2.5 rounded-[14px]"
                    onClick={() => {
                      setSelectedMemberId("");
                      setMemberSearchQuery("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search member by name, mobile or role..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 text-xs border border-border rounded-[14px] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
                    />
                    {memberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMemberSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtered Member Chips / List with 14px border radius */}
                  <div className="max-h-36 overflow-y-auto space-y-1 border border-border/70 rounded-[14px] p-1 bg-card">
                    {filteredMembers.length === 0 ? (
                      <p className="text-center py-3 text-xs text-muted-foreground">
                        No active members found. Switch to "Guest" for non-members.
                      </p>
                    ) : (
                      filteredMembers.slice(0, 15).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMemberId(m.id)}
                          className="w-full text-left p-2 rounded-[14px] hover:bg-muted/70 flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-foreground truncate">
                              {m.user?.name || "Member"}
                            </span>
                            {m.user?.phone && (
                              <span className="text-[11px] text-muted-foreground">
                                {m.user.phone}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                            {m.role}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contributor Content: Guest / Walk-in */}
          {contributorType === "GUEST" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-muted/20 border border-border rounded-[14px]">
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Haji Rafiqul Islam"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="text-xs h-9 rounded-[14px]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Phone (for SMS receipt)
                </label>
                <Input
                  placeholder="e.g. 01712-345678"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="text-xs h-9 rounded-[14px]"
                />
              </div>
            </div>
          )}

          {/* Contributor Content: Anonymous */}
          {contributorType === "ANONYMOUS" && (
            <div className="p-3 bg-muted/30 border border-border rounded-[14px] flex items-center gap-2 text-xs text-muted-foreground">
              <EyeOff className="w-4 h-4 text-[#006B5B] shrink-0" />
              <span>
                Recorded as <strong>Anonymous</strong>. The donor's identity is kept confidential and won't appear on public boards.
              </span>
            </div>
          )}
        </div>

        {/* STEP 3: Smart Payment Channel (Cash, Mobile Wallet, Bank) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            Payment Method <span className="text-destructive">*</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePaymentChannelChange("CASH")}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-[14px] border text-xs font-medium transition-all ${
                paymentChannel === "CASH"
                  ? "border-[#006B5B] bg-[#E6F4F0] text-[#006B5B] font-bold shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Banknote className="w-4 h-4" />
              Cash
            </button>

            <button
              type="button"
              onClick={() => handlePaymentChannelChange("ONLINE")}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-[14px] border text-xs font-medium transition-all ${
                paymentChannel === "ONLINE"
                  ? "border-[#006B5B] bg-[#E6F4F0] text-[#006B5B] font-bold shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              bKash / Nagad
            </button>

            <button
              type="button"
              onClick={() => handlePaymentChannelChange("BANK")}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-[14px] border text-xs font-medium transition-all ${
                paymentChannel === "BANK"
                  ? "border-[#006B5B] bg-[#E6F4F0] text-[#006B5B] font-bold shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Bank / Cheque
            </button>
          </div>

          {/* Account Sub-selector if multiple accounts exist for channel */}
          {channelAccounts.length > 1 ? (
            <div className="flex items-center justify-between text-[11px] pt-1 px-1">
              <span className="text-muted-foreground">Deposit into:</span>
              <div className="relative">
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="text-xs font-semibold text-[#006B5B] bg-transparent border-0 focus:ring-0 p-0 pr-4 cursor-pointer appearance-none"
                >
                  {channelAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="text-foreground">
                      {acc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#006B5B] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          ) : channelAccounts.length === 1 ? (
            <p className="text-[11px] text-muted-foreground px-1">
              Deposited to: <strong className="text-foreground">{channelAccounts[0]?.name}</strong>
            </p>
          ) : (
            <div className="text-[11px] text-amber-600 px-1">
              No matching {paymentChannel.toLowerCase()} account.
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="ml-1 text-xs text-foreground bg-card border border-border rounded-[14px] px-2 py-0.5"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Collapsible "+ Date, Category & Memo" */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowMoreDetails((prev) => !prev)}
            className="text-xs text-[#006B5B] hover:text-[#005246] font-medium flex items-center gap-1"
          >
            {showMoreDetails ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide extra details
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                + Date, Category & Memo (Optional)
              </>
            )}
          </button>

          {showMoreDetails && (
            <div className="space-y-2.5 mt-2 p-3 bg-muted/20 border border-border rounded-[14px] animate-in fade-in-0 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-1">
                    Date Received
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs h-8 rounded-[14px]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-1">
                    Income Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-border rounded-[14px] bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-[#006B5B] appearance-none cursor-pointer h-8"
                    >
                      {eligibleCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block mb-1">
                  Cheque / Reference Memo
                </label>
                <Input
                  placeholder="e.g. Cheque #4019, collected after Asr prayer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs h-8 rounded-[14px]"
                />
              </div>

              {contributorType !== "ANONYMOUS" && (
                <label className="flex items-center gap-2 pt-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymousPublic}
                    onChange={(e) => setIsAnonymousPublic(e.target.checked)}
                    className="rounded border-border text-[#006B5B] focus:ring-[#006B5B]"
                  />
                  <span className="text-xs text-muted-foreground">
                    Hide donor name on public portal (record in internal ledger only)
                  </span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions with 14px border radius */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-9 px-4 rounded-[14px]"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !amountMajor || Number(amountMajor) <= 0}
            className="bg-[#006B5B] hover:bg-[#005246] text-white text-xs font-semibold shadow-xs min-w-[150px] h-9 rounded-[14px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Coins className="w-3.5 h-3.5 mr-1.5" />
                {amountMajor && Number(amountMajor) > 0
                  ? `Record ৳${Number(amountMajor).toLocaleString()} Contribution`
                  : "Record Contribution"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
