import * as React from "react";
import {
  ShieldCheck,
  PiggyBank,
  Receipt,
  Users,
  Eye,
  ArrowLeftRight,
  Landmark,
  FileCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function MarketingFeatures() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Dual-Control Approvals (Maker-Checker)",
      badge: "Financial Governance",
      description:
        "Protect against unilateral spending. Expenses recorded by staff or treasurers must be reviewed and countersigned by authorized committee overseers before funds are disbursed.",
      highlights: [
        "Eliminates single-person financial risk",
        "Configurable approval thresholds",
        "Immutable sign-off audit trail",
      ],
    },
    {
      icon: PiggyBank,
      title: "Strict Zakat & Restricted Fund Isolation",
      badge: "Shariah Compliant",
      description:
        "Fulfill the sacred obligation of Zakat with zero commingling. Maintain segregated sub-ledgers for Zakat, Sadaqah, and Building Funds so charity money is never used for general utility bills.",
      highlights: [
        "Protected Zakat balance tracking",
        "Clear General vs Restricted fund designations",
        "Automated fund-level income & expense reporting",
      ],
    },
    {
      icon: Receipt,
      title: "Jummah Box Counting Sessions",
      badge: "Cash Custody",
      description:
        "End post-Jummah disputes over cash collections. Record physical currency denominations alongside multi-witness committee signatures before automatically posting to physical accounts.",
      highlights: [
        "Multi-witness sign-off required",
        "Detailed denomination breakdowns (notes & coins)",
        "Direct link to physical cash boxes or bank deposits",
      ],
    },
    {
      icon: Users,
      title: "Chanda & Recurring Membership Dues",
      badge: "Community Subscriptions",
      description:
        "Organize congregation member families, monthly subscriptions, and project pledges. Track collection rates and status (Paid, Partial, Unpaid, Waived) without messy spreadsheets.",
      highlights: [
        "Household and family member groupings",
        "Monthly dues status tracking & collection rates",
        "Pledge installment schedules with remaining balance",
      ],
    },
    {
      icon: FileCheck,
      title: "Tamper-Proof Verifiable Receipts",
      badge: "Audit Integrity",
      description:
        "Every donation generates an official digital receipt with an immutable verification code. Donors and tax authorities can authenticate receipt legitimacy on the public verification portal.",
      highlights: [
        "Cryptographic public receipt authentication",
        "Downloadable and shareable digital slips",
        "Eliminates fraudulent paper receipts",
      ],
    },
    {
      icon: Eye,
      title: "Public Financial Transparency Portal",
      badge: "Donor Trust",
      description:
        "Inspire community generosity through radical openness. Give your congregation a clean, read-only public web page displaying active fund balances, monthly income, and campaign milestones.",
      highlights: [
        "Customizable public link (e.g. /m/your-mosque)",
        "Real-time fund balance transparency",
        "Zero exposure of private member or donor details",
      ],
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-secondary/20 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Purpose-Built For Masjids
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
            Everything Your Mosque Committee Needs to Uphold Amanah
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Standard accounting tools were made for commercial corporations. Mosque Management
            was designed specifically around Islamic governance, cash collections, restricted charity funds,
            and congregation trust.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-14">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                className="p-6 sm:p-7 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary text-primary border border-primary/20">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-heading text-foreground mt-5 mb-2.5">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>

                <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
                  {feat.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
