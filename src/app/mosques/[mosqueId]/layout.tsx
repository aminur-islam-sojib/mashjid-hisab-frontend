"use client";

import * as React from "react";
import { MosqueProvider } from "@/providers/mosque-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

function TenantShell({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex shrink-0" />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileMenu={() => setIsMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MosqueTenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen overflow-hidden bg-background">
          <div className="w-64 border-r border-border bg-card hidden lg:block animate-pulse p-4" />
          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-border bg-card animate-pulse" />
            <div className="flex-1 p-6 space-y-4">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <MosqueProvider>
        <TenantShell>{children}</TenantShell>
      </MosqueProvider>
    </React.Suspense>
  );
}
