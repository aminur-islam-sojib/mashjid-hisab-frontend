import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mosque Management — Dashboard",
  description: "Modern Mosque and Community Management Platform",
};

import { ThemeProvider } from "@/components/layout/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full antialiased font-sans")}>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <QueryProvider>
          <Suspense fallback={null}>
            <AuthProvider>
              <ThemeProvider>
                {children}
                <Toaster position="top-right" richColors />
              </ThemeProvider>
            </AuthProvider>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}


