"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Search,
  Lock,
  PiggyBank,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MarketingTransparencySpotlight() {
  const router = useRouter();
  const [receiptCode, setReceiptCode] = React.useState("");

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = receiptCode.trim();
    if (clean) {
      router.push(`/verify-receipt/${encodeURIComponent(clean)}`);
    }
  };

  return (
    <section id="transparency" className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Radical Openness
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
            Inspire Community Generosity Through Transparency
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            When donors see exactly where their contributions go, giving flourishes. Provide your
            congregation with public transparency pages and instant receipt authentication.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-14">
          {/* Left Column: Public Transparency Portal Feature */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Public Transparency Showcase
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Live public link for your congregation
                    </p>
                  </div>
                </div>
                <Link href="/m/baitul-hikmah-rep-821540" target="_blank">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <span>View Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                <p>
                  Every mosque on the platform receives a dedicated, mobile-friendly public link:
                </p>
                <div className="px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-primary/20 font-mono text-xs text-primary flex items-center justify-between">
                  <span>https://mosquemanagement.org/m/your-mosque-slug</span>
                  <span className="text-[10px] font-sans font-semibold uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">
                    Public Read-Only
                  </span>
                </div>
                <p>
                  Donors can see overall fund balances, active campaign milestones, and month-by-month
                  treasury summaries. All sensitive personal contact information and private donor identities
                  remain strictly protected.
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Real-time Fund Allocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Zero Donor Privacy Exposure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Shareable on WhatsApp & SMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Customizable by Mosque Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Instant Receipt Authentication Widget */}
          <div className="lg:col-span-5">
            <Card className="p-6 sm:p-8 bg-card border-primary/30 shadow-md space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Verify a Donor Receipt
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Instant anti-tamper receipt authentication
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every digital receipt generated by Mosque Management comes with a secure verification
                code. Donors, auditors, and community members can verify receipt authenticity
                directly online:
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="receipt-input" className="text-xs font-semibold text-foreground">
                    Enter Verification Code:
                  </label>
                  <div className="relative">
                    <input
                      id="receipt-input"
                      type="text"
                      value={receiptCode}
                      onChange={(e) => setReceiptCode(e.target.value)}
                      placeholder="e.g. REC-2026-X892"
                      className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                    />
                    <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 gap-2 font-semibold justify-center"
                  disabled={!receiptCode.trim()}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify Official Receipt
                </Button>
              </form>

              <p className="text-[11px] text-muted-foreground text-center">
                Guarantees that your donation was recorded in the master ledger and has not been
                falsified or duplicated.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

