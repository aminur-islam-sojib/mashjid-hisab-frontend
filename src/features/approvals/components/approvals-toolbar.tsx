"use client";

import * as React from "react";
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApprovalKpis } from "../types";

interface ApprovalsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  distinctOwners: string[];
  kpis: ApprovalKpis;
  onResetFilters: () => void;
}

export function ApprovalsToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  statusFilter,
  onStatusFilterChange,
  distinctOwners,
  kpis,
  onResetFilters,
}: ApprovalsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input on Left */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search deals, party, occasion, fund, notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
        />
      </div>

      {/* Dropdown Filters on Right (Matching Stage ⌵, Owner ⌵, Status ⌵ in Reference) */}
      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
        {/* Stage / Type Dropdown */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Stage: All Types</option>
            <option value="DONATION">● Donations ({kpis.donationCount})</option>
            <option value="EXPENSE">● Expenses ({kpis.expenseCount})</option>
            <option value="COLLECTION">● Box Counts ({kpis.collectionCount})</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Owner / Creator Dropdown */}
        <div className="relative">
          <select
            value={ownerFilter}
            onChange={(e) => onOwnerFilterChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Owner: All</option>
            {distinctOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-xs rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Status: All</option>
            <option value="PENDING">Pending Signoff</option>
            <option value="IN_DELAY">In 5s Grace Period</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Reset Filters Icon Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          title="Reset Filters"
          className="h-8.5 w-8.5 p-0 rounded-xl border border-border bg-card hover:bg-muted"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

