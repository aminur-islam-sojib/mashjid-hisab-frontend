"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function MarketingCta() {
  const { user, activeMosqueId, isLoading } = useAuth();
  const dashboardHref = activeMosqueId
    ? `/mosques/${activeMosqueId}/dashboard`
    : "/mosques";

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-[#005a4d] to-[#004a3e] text-primary-foreground p-8 sm:p-14 lg:p-16 shadow-2xl text-center space-y-6">
          {/* Subtle background glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-sm mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Protect the Amanah Entrusted to You</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading max-w-3xl mx-auto leading-tight">
            Ready to Bring Transparent Financial Governance to Your Mosque?
          </h2>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate doubts, protect your committee against false accusations, and give your
            donors full confidence that every donation reaches its intended cause.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            {!isLoading && user ? (
              <Link href={dashboardHref}>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 h-11 px-6 font-semibold shadow-lg text-base gap-2"
                >
                  <span>Go to Mosque Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 h-11 px-6 font-semibold shadow-lg text-base gap-2"
                  >
                    <span>Register Your Mosque</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 h-11 px-6 text-base"
                  >
                    Sign In to Existing Mosque
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

