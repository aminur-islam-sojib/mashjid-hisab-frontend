"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MarketingFaq() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs = [
    {
      q: "How does dual-control approval protect our mosque against financial disputes?",
      a: "Under dual control (Maker-Checker), no single person—regardless of title—can disburse funds unilaterally. When a staff member or treasurer records an expense or disbursement, it is placed into a Pending Queue. A second authorized committee overseer (such as the Mosque Admin or Committee President) must review and approve it before the transaction is finalized.",
    },
    {
      q: "How does the system ensure Zakat is never commingled with operating expenses?",
      a: "Mosque Management features strict fund isolation. When donors contribute to the Zakat & Sadaqah Fund, those funds are tagged with restricted accounting logic. When disbursements are recorded, the system only allows spending against the designated fund, preventing Zakat funds from ever being depleted for utility bills or building maintenance.",
    },
    {
      q: "Can the general congregation view financial summaries without seeing private member information?",
      a: "Yes! Every mosque receives a public, read-only transparency link (e.g., /m/your-mosque). This page displays aggregated fund balances, monthly income/spending totals, and fundraising campaign progress. All donor names, contact numbers, and private transactions remain strictly concealed from the public view.",
    },
    {
      q: "How does weekly Jummah cash box counting work?",
      a: "After Friday prayers, authorized operators initiate a digital Counting Session. The system prompts them to enter the exact physical bill and coin counts (e.g., ৳1000, ৳500, ৳100 notes). At least two committee witnesses must digitally confirm the count. Once signed off, the total is locked into the cash ledger, leaving zero room for unaccounted cash.",
    },
    {
      q: "Can our mosque manage multiple bank accounts and physical cash safes?",
      a: "Absolutely. You can create multiple Physical Accounts—such as Main Mosque Safe, Petty Cash Register, and accounts across multiple commercial banks. You can also record inter-account transfers whenever cash is deposited into the bank with dual-control authorization.",
    },
    {
      q: "Can a committee member belong to more than one mosque?",
      a: "Yes. Mosque Management is a multi-tenant platform. A user can hold an active membership (with different assigned roles) across multiple mosques and switch between them seamlessly without having to create multiple logins.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-secondary/15 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
            Clear Answers for Mosque Trustees & Treasurers
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Everything you need to know about upholding Amanah and fiduciary compliance.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Card
                key={idx}
                className="overflow-hidden border-border/70 hover:border-primary/40 transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-foreground text-sm sm:text-base cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-primary shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

