import * as React from "react";
import Link from "next/link";
import { MosqueLogo } from "@/components/brand/logo";
import { ShieldCheck, Heart } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card text-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <MosqueLogo size="sm" />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              The modern Islamic financial management and community governance platform.
              Built from the ground up to uphold Amanah, isolate Zakat funds, and provide radical
              transparency for Muslim communities worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Amanah • Transparency • Dual Control</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Core Features
                </a>
              </li>
              <li>
                <a href="#governance" className="hover:text-foreground transition-colors">
                  Amanah & Governance
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#transparency" className="hover:text-foreground transition-colors">
                  Public Transparency
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Access Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Sign In to Mosque
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Register New Mosque
                </Link>
              </li>
              <li>
                <Link href="/mosques" className="hover:text-foreground transition-colors">
                  Switch Active Mosque
                </Link>
              </li>
              <li>
                <Link href="/m/baitul-hikmah-rep-821540" className="hover:text-foreground transition-colors">
                  Public Transparency Demo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Mosque Management. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Upholding Amanah (الأمانة) for the Ummah</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
