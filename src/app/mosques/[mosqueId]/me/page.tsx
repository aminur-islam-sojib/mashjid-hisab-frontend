"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Coins,
  Receipt,
  HeartHandshake,
  FileText,
  Calendar,
  Users,
  Printer,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/money";
import { useAuth } from "@/providers/auth-provider";

export default function MemberPortalPage() {
  const params = useParams();
  const mosqueId = params["mosqueId"] as string;
  const { user } = useAuth();
  console.log("User in MemberPortalPage:", user);

  const [activeTab, setActiveTab] = React.useState<"donations" | "dues" | "pledges" | "statement">("donations");
  const [scope, setScope] = React.useState<"self" | "family">("self");
  const currentYear = new Date().getFullYear();
  const [statementYear, setStatementYear] = React.useState(currentYear);

  // 1. Fetch Donations
  const { data: donationsData, isLoading: isDonationsLoading } = useQuery<any>({
    queryKey: ["my-donations", mosqueId, scope],
    queryFn: () =>
      apiClient.get<any>(`/mosques/${mosqueId}/me/donations?scope=${scope}&limit=50`),
    enabled: activeTab === "donations",
  });

  // 2. Fetch Dues
  const { data: duesData, isLoading: isDuesLoading } = useQuery<any>({
    queryKey: ["my-dues", mosqueId, scope],
    queryFn: () =>
      apiClient.get<any>(`/mosques/${mosqueId}/me/dues?scope=${scope}&limit=50`),
    enabled: activeTab === "dues",
  });

  // 3. Fetch Pledges
  const { data: pledgesData, isLoading: isPledgesLoading } = useQuery<any>({
    queryKey: ["my-pledges", mosqueId, scope],
    queryFn: () =>
      apiClient.get<any>(`/mosques/${mosqueId}/me/pledges?scope=${scope}&limit=50`),
    enabled: activeTab === "pledges",
  });

  // 4. Fetch Annual Statement
  const { data: statementData, isLoading: isStatementLoading } = useQuery<any>({
    queryKey: ["my-statement", mosqueId, statementYear, scope],
    queryFn: () =>
      apiClient.get<any>(`/mosques/${mosqueId}/me/statement?year=${statementYear}&scope=${scope}`),
    enabled: activeTab === "statement",
  });

  const donations = donationsData?.donations || donationsData?.data || [];
  const dues = duesData?.dues || duesData?.data || [];
  const pledges = pledgesData?.pledges || pledgesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Giving & Member Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Personal donation receipts, recurring Chanda records, and annual giving certificates.
          </p>
        </div>

        {/* Scope Toggle */}
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setScope("self")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              scope === "self"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Giving
          </button>
          <button
            type="button"
            onClick={() => setScope("family")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              scope === "family"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Family Household
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("donations")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "donations"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>My Donations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dues")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "dues"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Dues & Subscriptions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pledges")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "pledges"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>My Pledges</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("statement")}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "statement"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Annual Statement</span>
        </button>
      </div>

      {/* Tab 1: My Donations */}
      {activeTab === "donations" && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          {isDonationsLoading ? (
            <div className="py-16 text-center text-gray-500">
              Loading personal donations...
            </div>
          ) : donations.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Coins className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No donations recorded yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Your future donations and verified receipts will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Receipt Number</Th>
                  <Th>Fund</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Payment Method</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donations.map((d: any) => (
                  <Tr key={d.id}>
                    <Td className="whitespace-nowrap font-medium text-gray-700">
                      {new Date(d.date).toLocaleDateString()}
                    </Td>
                    <Td className="font-mono text-xs text-gray-600">
                      {d.receiptNumber || "Pending"}
                    </Td>
                    <Td className="text-xs text-gray-600">
                      {d.fund?.name || "General Fund"}
                    </Td>
                    <Td className="text-right font-bold text-[#006B5B] whitespace-nowrap">
                      {formatCurrency(d.amount)}
                    </Td>
                    <Td className="text-xs text-gray-600">{d.source || "CASH"}</Td>
                    <Td>
                      <Badge variant="success">Posted</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </div>
      )}

      {/* Tab 2: Dues */}
      {activeTab === "dues" && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          {isDuesLoading ? (
            <div className="py-16 text-center text-gray-500">
              Loading membership dues...
            </div>
          ) : dues.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No dues invoices found</p>
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Period</Th>
                  <Th>Fund</Th>
                  <Th className="text-right">Billed</Th>
                  <Th className="text-right">Paid</Th>
                  <Th className="text-right">Balance Due</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dues.map((due: any) => {
                  const remaining =
                    BigInt(due.amount || "0") - BigInt(due.paidAmount || "0");
                  return (
                    <Tr key={due.id}>
                      <Td className="font-medium text-gray-700">{due.period}</Td>
                      <Td className="text-xs text-gray-600">
                        {due.fund?.name || "General Fund"}
                      </Td>
                      <Td className="text-right font-semibold text-gray-900">
                        {formatCurrency(due.amount)}
                      </Td>
                      <Td className="text-right text-emerald-700 font-medium">
                        {formatCurrency(due.paidAmount)}
                      </Td>
                      <Td className="text-right font-bold text-[#006B5B]">
                        {formatCurrency(remaining > 0n ? remaining.toString() : "0")}
                      </Td>
                      <Td>
                        {due.status === "PAID" ? (
                          <Badge variant="success">Paid</Badge>
                        ) : due.status === "PARTIAL" ? (
                          <Badge variant="warning">Partial</Badge>
                        ) : (
                          <Badge variant="danger">Unpaid</Badge>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </div>
      )}

      {/* Tab 3: Pledges */}
      {activeTab === "pledges" && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          {isPledgesLoading ? (
            <div className="py-16 text-center text-gray-500">
              Loading pledges...
            </div>
          ) : pledges.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <HeartHandshake className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No active pledges</p>
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Due Date</Th>
                  <Th>Target</Th>
                  <Th className="text-right">Committed</Th>
                  <Th className="text-right">Paid</Th>
                  <Th className="text-right">Remaining</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pledges.map((p: any) => {
                  const rem =
                    BigInt(p.amount || "0") - BigInt(p.paidAmount || "0");
                  return (
                    <Tr key={p.id}>
                      <Td className="font-medium text-gray-700">
                        {new Date(p.dueDate).toLocaleDateString()}
                      </Td>
                      <Td className="text-xs text-gray-600">
                        {p.campaign?.title
                          ? `Campaign: ${p.campaign.title}`
                          : p.fund?.name || "General Fund"}
                      </Td>
                      <Td className="text-right font-semibold text-gray-900">
                        {formatCurrency(p.amount)}
                      </Td>
                      <Td className="text-right text-emerald-700 font-medium">
                        {formatCurrency(p.paidAmount)}
                      </Td>
                      <Td className="text-right font-bold text-[#006B5B]">
                        {formatCurrency(rem > 0n ? rem.toString() : "0")}
                      </Td>
                      <Td>
                        <Badge variant="outline">{p.status}</Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </div>
      )}

      {/* Tab 4: Annual Statement */}
      {activeTab === "statement" && (
        <div className="max-w-3xl space-y-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Statement Year:</span>
              <select
                value={statementYear}
                onChange={(e) => setStatementYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B]"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>
                    Fiscal Year {y}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs border-gray-300 hover:bg-gray-50"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Certificate
            </Button>
          </div>

          {/* Statement Document Sheet */}
          <div className="p-8 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-6 print:border-none print:shadow-none">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-xs font-bold text-[#006B5B] uppercase tracking-wider block">
                Official Giving Statement
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Annual Contribution Certificate — {statementYear}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Issued for {user?.name || "Member"} • Fiscal Year {statementYear}
              </p>
            </div>

            {isStatementLoading ? (
              <div className="py-12 text-center text-gray-400">
                Generating annual statement...
              </div>
            ) : !statementData ? (
              <div className="py-12 text-center text-gray-400">
                No contribution statement available for {statementYear}.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-[#E6F4F0] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#006B5B]">
                      Total Annual Giving
                    </span>
                    <div className="text-3xl font-black text-[#006B5B] mt-1">
                      {formatCurrency(statementData.totalAmount || "0")}
                    </div>
                  </div>
                  <span className="text-xs text-[#006B5B] font-medium">
                    {statementData.donationCount || 0} Posted Donations
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Allocation per Fund
                  </h4>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Fund Name</Th>
                          <Th className="text-right">Total Donated</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(statementData.byFund || statementData.funds || []).map(
                          (f: any, idx: number) => (
                            <Tr key={idx}>
                              <Td className="font-semibold text-gray-900">
                                {f.fundName || f.name}
                              </Td>
                              <Td className="text-right font-bold text-[#006B5B]">
                                {formatCurrency(f.totalAmount || f.amount || "0")}
                              </Td>
                            </Tr>
                          )
                        )}
                      </Tbody>
                    </Table>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 italic pt-4 border-t border-gray-100">
                  This document serves as an audited acknowledgement of charitable contributions
                  recorded in the mosque financial management ledger for the designated fiscal period.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
