"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Receipt,
  Eye,
} from "lucide-react";
import { MosqueLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/components/layout/theme-provider";

export function MarketingNavbar() {
  const { user, activeMosqueId, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const dashboardHref = activeMosqueId
    ? `/mosques/${activeMosqueId}/dashboard`
    : "/mosques";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <MosqueLogo size="sm" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#governance"
            className="hover:text-foreground transition-colors"
          >
            Amanah & Governance
          </a>
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#transparency"
            className="hover:text-foreground transition-colors"
          >
            Public Transparency
          </a>
          <a
            href="#faq"
            className="hover:text-foreground transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </Button>

          {/* Auth State Aware Actions */}
          {!isLoading && user ? (
            <Link href={dashboardHref}>
              <Button size="sm" className="gap-1.5 shadow-xs font-semibold">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Go to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1 shadow-xs font-semibold">
                  <span>Register Mosque</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-secondary/30 text-foreground"
            >
              Features
            </a>
            <a
              href="#governance"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-secondary/30 text-foreground"
            >
              Amanah & Governance
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-secondary/30 text-foreground"
            >
              How It Works
            </a>
            <a
              href="#transparency"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-secondary/30 text-foreground"
            >
              Public Transparency
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-secondary/30 text-foreground"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-border/70 flex flex-col gap-2">
            {!isLoading && user ? (
              <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gap-2 justify-center">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center gap-1.5 font-semibold">
                    Register Mosque
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

