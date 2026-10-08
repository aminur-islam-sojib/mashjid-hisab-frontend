"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Landmark,
  TrendingUp,
  TrendingDown,
  Clock,
  PiggyBank,
  Sparkles,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

export function MarketingHero() {
  const { user, activeMosqueId, isLoading } = useAuth();
  const dashboardHref = activeMosqueId
    ? `/mosques/${activeMosqueId}/dashboard`
    : "/mosques";

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
      {/* Background Decorative Gradients & Islamic Motif Subtle Geometry */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1100px] h-[550px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Centered Content */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Amanah Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 text-primary border border-primary/20 text-xs sm:text-sm font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Dedicated to Amanah (الأمانة) & Financial Transparency</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading text-foreground leading-[1.12]">
            Modern Financial Governance &{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Complete Transparency
            </span>{" "}
            for Masjids
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            The all-in-one financial operating system purpose-built for mosque committees,
            treasurers, and imams. Protect your community’s trust with dual-control expense
            approvals, strict Zakat fund segregation, Jummah cash counting sessions, and verified
            public donor transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {!isLoading && user ? (
              <Link href={dashboardHref}>
                <Button size="lg" className="h-11 px-6 gap-2 text-base font-semibold shadow-md">
                  <span>Open Mosque Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="h-11 px-6 gap-2 text-base font-semibold shadow-md">
                    <span>Register Your Mosque</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-11 px-5 text-base">
                    Sign In to Existing Mosque
                  </Button>
                </Link>
              </>
            )}
            <a href="#transparency">
              <Button variant="secondary" size="lg" className="h-11 px-5 gap-2 text-base">
                <Eye className="w-4 h-4 text-primary" />
                <span>See Public Portal</span>
              </Button>
            </a>
          </div>

          {/* Key Value Guarantee Bullets */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Dual-Control Approvals
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Zakat Isolated Accounting
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Multi-Witness Jummah Counting
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verifiable QR Receipts
            </span>
          </div>
        </div>

        {/* Realistic Product Dashboard Mockup Card */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-2xl p-4 sm:p-7 overflow-hidden">
            {/* Top Mockup Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border/60 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      Baitul Hikmah Central Jame Mosque
                    </h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Live Audit Active
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fiscal Period: 2026-10 • Dual-Control Policy Enforced
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-secondary text-primary font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Dual-Control Signoff Required
                </span>
              </div>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-background border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Total Treasury</span>
                  <Landmark className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-base sm:text-xl font-bold font-heading text-foreground">
                  ৳ 16,200.00
                </div>
                <p className="text-[10px] text-muted-foreground">Cash Box & Bank Accounts</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-background border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Monthly Collections</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-base sm:text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
                  ৳ 2,050.00
                </div>
                <p className="text-[10px] text-muted-foreground">Jummah boxes & donations</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-background border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Monthly Spending</span>
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="text-base sm:text-xl font-bold font-heading text-foreground">
                  ৳ 850.00
                </div>
                <p className="text-[10px] text-muted-foreground">Utilities & maintenance</p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-background border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Approval Queue</span>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-base sm:text-xl font-bold font-heading text-foreground">
                  1 Pending
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Awaiting Treasurer review
                </p>
              </div>
            </div>

            {/* Split Details: Physical Accounts & Restricted Funds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Accounts */}
              <div className="p-4 rounded-xl bg-background border border-border/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-primary" />
                    Physical Accounts Breakdown
                  </span>
                  <span className="text-[11px] text-muted-foreground">In Custody</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                    <div>
                      <p className="font-semibold text-foreground">Cash Box 821540</p>
                      <p className="text-[10px] text-muted-foreground">Main mosque safe (Cash)</p>
                    </div>
                    <span className="font-bold font-heading">৳ 6,200.00</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="font-semibold text-foreground">Bank Account 821540</p>
                      <p className="text-[10px] text-muted-foreground">Islami Bank Bangladesh PLC</p>
                    </div>
                    <span className="font-bold font-heading">৳ 10,000.00</span>
                  </div>
                </div>
              </div>

              {/* Funds */}
              <div className="p-4 rounded-xl bg-background border border-border/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <PiggyBank className="w-3.5 h-3.5 text-primary" />
                    Dedicated Accounting Funds
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Shariah Isolated</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground">General Operating Fund</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Unrestricted masjid expenses</p>
                    </div>
                    <span className="font-bold font-heading">৳ 1,200.00</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground">Zakat & Sadaqah Fund</p>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                          Restricted
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Designated for eligible recipients</p>
                    </div>
                    <span className="font-bold font-heading">৳ 0.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Dual-Control Banner */}
            <div className="mt-4 p-3 rounded-xl bg-secondary/50 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-secondary-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong>Dual-Control Safety:</strong> Disbursements over ৳500 require 2 committee
                  approvals before leaving the treasury.
                </span>
              </div>
              <span className="text-[11px] text-primary font-semibold shrink-0">
                100% Audit Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

