"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    if (type === "password" && showPasswordToggle) {
      return (
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "border-border file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-9 w-full rounded-xl border bg-transparent px-3 py-1 pr-10 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            disabled={props.disabled}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "border-border file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 flex h-9 w-full rounded-xl border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type">
>((props, ref) => <Input type="password" ref={ref} {...props} />);
PasswordInput.displayName = "PasswordInput";

export { Input };
