import type { Metadata } from "next";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingHero } from "@/components/marketing/hero";
import { MarketingFeatures } from "@/components/marketing/features";
import { MarketingGovernance } from "@/components/marketing/governance";
import { MarketingWorkflow } from "@/components/marketing/workflow";
import { MarketingTransparencySpotlight } from "@/components/marketing/transparency-spotlight";
import { MarketingFaq } from "@/components/marketing/faq";
import { MarketingCta } from "@/components/marketing/cta";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Mosque Management — Modern Financial Governance & Amanah for Masjids",
  description:
    "The purpose-built financial operating system for mosque committees, treasurers, and imams. Featuring dual-control approvals, strict Zakat fund segregation, Jummah box counting, and public community transparency.",
};

export default function RootHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      <MarketingNavbar />
      <main className="flex-1">
        <MarketingHero />
        <MarketingFeatures />
        <MarketingGovernance />
        <MarketingWorkflow />
        <MarketingTransparencySpotlight />
        <MarketingFaq />
        <MarketingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
