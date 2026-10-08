import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mosque Management — Dashboard",
  description: "Modern Mosque and Community Management Platform",
};

import { ThemeProvider } from "@/components/layout/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-full flex flex-col bg-background text-foreground transition-colors duration-200 font-sans text-base",
          inter.className
        )}
      >
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


