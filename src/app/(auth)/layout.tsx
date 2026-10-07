import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Decorative background ambient circles matching brand tokens */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#B89A5A]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <main className="relative z-10 w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

