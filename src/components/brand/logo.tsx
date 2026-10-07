import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  collapsed?: boolean;
}

export function MosqueLogo({ className, size = "md", collapsed = false }: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className={cn("relative shrink-0 flex items-center justify-center", iconSizes[size])}>
        {/* Crisp representation of the approved logo mark */}
        <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
          <Image
            src="/images/approved-logo.png"
            alt="Mosque Management Logo"
            width={56}
            height={56}
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-bold tracking-tight text-[#006B5B] dark:text-[#39b89e] font-serif">
            MOSQUE
          </span>
          <span className="text-[9px] font-semibold tracking-[0.22em] text-[#647875] dark:text-[#9ab6af] uppercase mt-0.5">
            MANAGEMENT
          </span>
        </div>
      )}
    </div>
  );
}

