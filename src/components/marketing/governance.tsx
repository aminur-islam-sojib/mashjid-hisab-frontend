import * as React from "react";
import {
  XCircle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Users2,
  Lock,
  Layers,
  History,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export function MarketingGovernance() {
  return (
    <section id="governance" className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Amanah & Governance
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-foreground">
            Replacing Vulnerability With Structural Accountability
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            In many communities, good people are unfairly doubted simply because the mosque lacks
            transparent systems. We replace paper notebooks and single-key custody with institutional-grade
            dual control.
          </p>
        </div>

        {/* Side-by-side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14 max-w-5xl mx-auto">
          {/* Traditional Way */}
          <div className="p-6 sm:p-8 rounded-3xl border border-destructive/20 bg-destructive/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">The Vulnerable Traditional Way</h3>
                <p className="text-xs text-muted-foreground">Paper books, spreadsheets & solo custody</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-foreground/85">
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  <strong>Single-person custody:</strong> One individual holds cash boxes or writes
                  checks without mandatory verification from a second trustee.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  <strong>Commingled Zakat:</strong> Obligatory Zakat funds are deposited into general
                  bank accounts and accidentally spent on electricity or cleaning.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  <strong>Unwitnessed Jummah counting:</strong> Cash is counted by one person in a back
                  room, leading to whispers, doubt, and community disputes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  <strong>Lost receipts & contentious meetings:</strong> Paper receipts get misplaced,
                  turning Annual General Meetings (AGMs) into stressful arguments.
                </span>
              </li>
            </ul>
          </div>

          {/* Mosque Management Way */}
          <div className="p-6 sm:p-8 rounded-3xl border border-primary/30 bg-secondary/15 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">With Mosque Management</h3>
                <p className="text-xs text-muted-foreground">Digital dual control & complete transparency</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-foreground/85">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Enforced dual control:</strong> Expenses require Maker-Checker sign-offs
                  between Staff/Treasurer and the Committee President before release.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Isolated fund ledgers:</strong> Zakat, Sadaqah, and Building Funds are
                  quarantined in the system, preventing improper cross-fund disbursement.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-witness counting sessions:</strong> Minimum 2 witnesses record physical
                  note counts immediately after Jummah, freezing the audit record instantly.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Cryptographic receipts & open transparency:</strong> Instant verifiable
                  digital receipts and a public portal that unites the community in trust.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Roles Strip */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl border border-border/70 bg-card max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
            <div>
              <h4 className="text-base font-bold text-foreground">
                Role-Based Separation of Duties (RBAC)
              </h4>
              <p className="text-xs text-muted-foreground">
                Every user only has access to what their role requires.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-primary border border-primary/20 w-fit">
              Least-Privilege Security
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 text-center">
            <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5">
              <p className="text-xs font-bold text-foreground">Mosque Admin</p>
              <p className="text-[10px] text-muted-foreground">Governance, users & final approvals</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5">
              <p className="text-xs font-bold text-foreground">Treasurer</p>
              <p className="text-[10px] text-muted-foreground">Accounts, ledgers & bank transfers</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5">
              <p className="text-xs font-bold text-foreground">Committee</p>
              <p className="text-[10px] text-muted-foreground">Audit oversight & period reviews</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5">
              <p className="text-xs font-bold text-foreground">Staff / Collector</p>
              <p className="text-[10px] text-muted-foreground">Donation entry & box counting witness</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/50 space-y-1.5 col-span-2 sm:col-span-1">
              <p className="text-xs font-bold text-foreground">Congregation</p>
              <p className="text-[10px] text-muted-foreground">Giving history & verified receipts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
