"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  usePortal?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  usePortal = false,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="modal-portal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in-0 duration-200 print:static print:inset-auto print:p-0 print:m-0 print:block">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] my-auto flex flex-col rounded-2xl bg-card p-4 sm:p-6 shadow-xl border border-border text-card-foreground z-10 transition-all zoom-in-95 print:static print:w-full print:max-w-none print:max-h-none print:m-0 print:p-0 print:border-none print:shadow-none print:bg-transparent print:text-inherit print:overflow-visible",
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-border shrink-0 print:hidden">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold font-heading text-foreground">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 sm:mt-4 flex-1 overflow-y-auto min-h-0 overscroll-contain pr-1 -mr-1 print:overflow-visible print:mt-0 print:p-0 print:m-0">
          {children}
        </div>
      </div>
    </div>
  );

  if (usePortal && mounted && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}


