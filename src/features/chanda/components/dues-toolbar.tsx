import * as React from "react";
import { Search } from "lucide-react";

interface DuesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function DuesToolbar({
  search,
  onSearchChange,
  selectedPeriod,
  onPeriodChange,
  statusFilter,
  onStatusFilterChange,
}: DuesToolbarProps) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search member or family..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
        />
      </div>

      <div className="w-full sm:w-44">
        <input
          type="month"
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
        />
      </div>

      <div className="w-full sm:w-44">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
        >
          <option value="">All Statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>
    </div>
  );
}

