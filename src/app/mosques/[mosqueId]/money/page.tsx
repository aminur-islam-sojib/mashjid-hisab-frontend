"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { History, ArrowLeftRight, Landmark, PiggyBank, Tags } from "lucide-react";
import { TransactionsView } from "@/features/transactions/components/transactions-view";
import { TransfersView } from "@/features/transfers/components/transfers-view";
import { AccountsView } from "@/features/accounts/components/accounts-view";
import { FundsView } from "@/features/funds/components/funds-view";
import { CategoriesView } from "@/features/categories/components/categories-view";

type MoneyTab = "transactions" | "transfers" | "accounts" | "funds" | "categories";

function MoneyContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mosqueId = String(params?.["mosqueId"] || "");

  const tabParam = searchParams?.get("tab") as MoneyTab | null;
  const currentTab: MoneyTab =
    tabParam === "transfers" ||
    tabParam === "accounts" ||
    tabParam === "funds" ||
    tabParam === "categories"
      ? tabParam
      : "transactions";

  const handleTabChange = (newTab: MoneyTab) => {
    router.push(`/mosques/${mosqueId}/money${newTab === "transactions" ? "" : `?tab=${newTab}`}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Money & Accounts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master transactions, bank transfers, physical accounts, fund reserves, and categories.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl w-fit overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => handleTabChange("transactions")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "transactions"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>All Transactions</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("transfers")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "transfers"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Transfers</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("accounts")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "accounts"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Cash & Bank</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("funds")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "funds"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>Funds</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("categories")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
            currentTab === "categories"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tags className="w-3.5 h-3.5" />
          <span>Categories</span>
        </button>
      </div>

      {/* Tab Panels */}
      {currentTab === "transactions" && <TransactionsView mosqueId={mosqueId} />}
      {currentTab === "transfers" && <TransfersView mosqueId={mosqueId} />}
      {currentTab === "accounts" && <AccountsView mosqueId={mosqueId} />}
      {currentTab === "funds" && <FundsView mosqueId={mosqueId} />}
      {currentTab === "categories" && <CategoriesView mosqueId={mosqueId} />}
    </div>
  );
}

export default function MoneyPage() {
  return (
    <React.Suspense fallback={<div className="py-16 text-center text-xs text-muted-foreground">Loading...</div>}>
      <MoneyContent />
    </React.Suspense>
  );
}

