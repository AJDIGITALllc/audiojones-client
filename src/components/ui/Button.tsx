import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-brand-orange text-white hover:bg-brand-orange/90 focus:ring-brand-orange":
            variant === "primary",
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500":
            variant === "secondary",
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500":
            variant === "outline",
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 text-sm": size === "md",
          "h-12 px-6 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

