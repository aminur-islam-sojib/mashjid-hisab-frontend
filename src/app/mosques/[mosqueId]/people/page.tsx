"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Users, Home, CalendarHeart, HeartHandshake } from "lucide-react";
import { useMosque } from "@/providers/mosque-provider";
import { MembersView } from "@/features/members/components/members-view";
import { FamiliesView } from "@/features/families/components/families-view";
import { ChandaPage } from "@/features/chanda/chanda-page";
import { PledgesView } from "@/features/pledges/components/pledges-view";

type PeopleTab = "members" | "families" | "chanda" | "pledges";

function PeopleContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeRole } = useMosque();
  const mosqueId = String(params?.["mosqueId"] || "");

  const isMember = activeRole === "MEMBER";
  const tabParam = searchParams?.get("tab") as PeopleTab | null;
  const currentTab: PeopleTab = isMember
    ? "pledges"
    : tabParam === "families" || tabParam === "chanda" || tabParam === "pledges"
      ? tabParam
      : "members";

  const handleTabChange = (newTab: PeopleTab) => {
    router.push(`/mosques/${mosqueId}/people${newTab === "members" ? "" : `?tab=${newTab}`}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            {isMember ? "My Pledges" : "People & Community"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isMember
              ? "Track your pledged contributions and fulfillment progress."
              : "Congregation members, family households, monthly Chanda dues, and pledges."}
          </p>
        </div>
      </div>

      {/* Tabs (Hidden for congregant members who only access pledges) */}
      {!isMember && (
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl w-fit overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleTabChange("members")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              currentTab === "members"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members</span>
          </button>

        <button
          type="button"
          onClick={() => handleTabChange("families")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "families"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Families</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("chanda")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "chanda"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarHeart className="w-3.5 h-3.5" />
          <span>Chanda & Dues</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("pledges")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "pledges"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Pledges</span>
        </button>
      </div>
      )}

      {/* Tab Panels */}
      {currentTab === "members" && <MembersView mosqueId={mosqueId} />}
      {currentTab === "families" && <FamiliesView mosqueId={mosqueId} />}
      {currentTab === "chanda" && <ChandaPage mosqueId={mosqueId} />}
      {currentTab === "pledges" && <PledgesView mosqueId={mosqueId} />}
    </div>
  );
}

export default function PeoplePage() {
  return (
    <React.Suspense fallback={<div className="py-16 text-center text-xs text-muted-foreground">Loading...</div>}>
      <PeopleContent />
    </React.Suspense>
  );
}

