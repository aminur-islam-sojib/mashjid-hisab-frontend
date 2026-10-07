"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Coins,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  CheckSquare,
  ShieldCheck,
  Globe,
  Users,
  Calendar,
  Lock,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MosqueLogo } from "@/components/brand/logo";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";

export default function PublicMosqueTransparencyPage() {
  const params = useParams();
  const slug = params["slug"] as string;

  // 1. Fetch Mosque Public Profile
  const { data: mosque, isError: isMosqueError } = useQuery<any>({
    queryKey: ["public-mosque", slug],
    queryFn: () => apiClient.get<any>(`/public/mosques/${slug}`),
  });

  // 2. Fetch Funds Summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery<any>({
    queryKey: ["public-summary", slug],
    queryFn: () => apiClient.get<any>(`/public/mosques/${slug}/summary`),
  });

  // 3. Fetch Public Campaigns
  const { data: campaignsData } = useQuery<any>({
    queryKey: ["public-campaigns", slug],
    queryFn: () => apiClient.get<any>(`/public/mosques/${slug}/campaigns`),
  });

  // 4. Fetch Recent Donations Feed
  const { data: donationsFeed } = useQuery<any>({
    queryKey: ["public-donations", slug],
    queryFn: () => apiClient.get<any>(`/public/mosques/${slug}/donations?limit=15`),
  });

  // 5. Fetch Expenses Summary
  const { data: expensesSummary } = useQuery<any>({
    queryKey: ["public-expenses", slug],
    queryFn: () => apiClient.get<any>(`/public/mosques/${slug}/expenses/summary`),
  });

  if (isMosqueError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <Lock className="w-12 h-12 text-gray-400 mb-3" />
        <h1 className="text-xl font-bold text-gray-900">
          Transparency Page Unavailable
        </h1>
        <p className="text-sm text-gray-500 max-w-md mt-1">
          This mosque either does not exist or has disabled public financial transparency.
        </p>
      </div>
    );
  }

  const funds = summaryData?.funds || summaryData || [];
  const campaigns = campaignsData?.campaigns || campaignsData || [];
  const donations = donationsFeed?.donations || donationsFeed?.items || donationsFeed || [];
  const expenses = expensesSummary?.categories || expensesSummary || [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MosqueLogo size="sm" />
            <div>
              <span className="font-bold text-gray-900 text-sm block">
                {mosque?.name || "Mosque Transparency Portal"}
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5">
                Public Accountability Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6F4F0] text-[#006B5B]">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified Organization
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#006B5B] text-white py-12 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-xs mb-3">
                <Globe className="w-3.5 h-3.5 text-[#B89A5A]" />
                <span>Open Financial Governance</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {mosque?.name || "Baitul Aman Jame Masjid"}
              </h1>
              <p className="text-sm text-teal-100 mt-2 max-w-xl">
                {mosque?.address || "Dedicated to congregation trust through real-time ledger accounting."}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-right">
              <span className="text-xs uppercase font-semibold text-teal-100 tracking-wider">
                Total Fund Balances
              </span>
              <div className="text-3xl font-black mt-1 text-white">
                {formatCurrency(summaryData?.totalBalance || "0")}
              </div>
              <span className="text-xs text-teal-200 mt-1 block">
                Audited Current Reserves
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Funds Summary Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fund Reserves (FYTD)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Current balances and collection totals across designated mosque funds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(funds) &&
              funds.map((f: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {f.name}
                    </span>
                    {f.isRestricted && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">
                        Restricted
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-2xl font-black text-[#006B5B] block">
                      {formatCurrency(f.currentBalance || "0")}
                    </span>
                    <span className="text-xs text-gray-400">Current Balance</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span>Collected: {formatCurrency(f.totalCollected || "0")}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Active Campaigns */}
        {Array.isArray(campaigns) && campaigns.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Fundraising Appeals</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Support special community developments and ongoing capital campaigns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map((camp: any) => {
                const percent = camp.progress?.progressPercent ?? 0;
                return (
                  <div
                    key={camp.id}
                    className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs space-y-4"
                  >
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6F4F0] text-[#006B5B]">
                        {camp.fund?.name || "General Appeal"}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-2 line-clamp-1">
                        {camp.title}
                      </h3>
                      {camp.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {camp.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[#006B5B]">
                          {formatCurrency(camp.progress?.raisedAmount || "0")}
                        </span>
                        {camp.targetAmount && (
                          <span className="text-xs text-gray-400">
                            of {formatCurrency(camp.targetAmount)}
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#006B5B] h-2 rounded-full"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{percent}% achieved</span>
                        <span>{camp.progress?.donorCount || 0} Donors</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Dual Grid: Recent Donations & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Donations Feed */}
          <section className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Recent Contributions</h3>
              </div>
              <span className="text-xs text-gray-400">Live feed</span>
            </div>

            {!Array.isArray(donations) || donations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No recent public donations recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {donations.map((d: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        {d.donorName || "Generous Donor"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(d.date).toLocaleDateString()} • {d.fundName || "General Fund"}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700">
                      +{formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Expense Categories Breakdown */}
          <section className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-900">Expense Deployments (FYTD)</h3>
              </div>
              <span className="text-xs text-gray-400">Category totals</span>
            </div>

            {!Array.isArray(expenses) || expenses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                No categorized expenses recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {expenses.map((exp: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        {exp.categoryName || exp.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {exp.count ? `${exp.count} vouchers` : "Audited expenses"}
                      </span>
                    </div>
                    <span className="font-bold text-red-700">
                      -{formatCurrency(exp.totalAmount || exp.amount || "0")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
