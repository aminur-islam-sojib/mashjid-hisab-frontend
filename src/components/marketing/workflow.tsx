import * as React from "react";
import {
  Building2,
  UserCheck,
  Receipt,
  Globe2,
  ArrowRight,
} from "lucide-react";

export function MarketingWorkflow() {
  const steps = [
    {
      step: "01",
      icon: Building2,
      title: "Register & Set Up Accounts",
      description:
        "Register your mosque in under two minutes. Configure physical cash boxes, commercial bank accounts, and dedicated fund buckets (General, Zakat, Sadaqah, Building).",
    },
    {
      step: "02",
      icon: UserCheck,
      title: "Invite Trustees & Operators",
      description:
        "Grant role-based access to committee members, treasurers, and imams. Establish dual-control authorization limits suited to your mosque's governance policies.",
    },
    {
      step: "03",
      icon: Receipt,
      title: "Record Operations & Collections",
      description:
        "Log Friday Jummah box counts with multi-witness signoffs, track monthly family Chanda dues, issue cryptographic receipts, and submit disbursements for approval.",
    },
    {
      step: "04",
      icon: Globe2,
      title: "Publish Real-Time Transparency",
      description:
        "Close accounting periods with one click. Share your mosque's unique public transparency URL so donors and community members see verified financial accountability.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-secondary/15 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
            How Masjids Transition to Modern Governance
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Get your mosque up and running with clean financial books in a single afternoon. No
            complex accounting jargon required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-14">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative p-6 sm:p-7 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black font-heading text-primary/30 group-hover:text-primary transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold font-heading text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
