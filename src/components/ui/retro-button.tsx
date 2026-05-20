import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes } from "react";

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger";
}

export function RetroButton({
  variant = "default",
  className,
  style,
  children,
  ...props
}: RetroButtonProps) {
  const variantStyle =
    variant === "primary"
      ? {
          backgroundColor: "var(--t-accent)",
          color: "var(--t-titlebar-text)",
          borderTopColor: "var(--t-accent-hover)",
          borderLeftColor: "var(--t-accent-hover)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
        }
      : variant === "danger"
      ? {
          backgroundColor: "var(--t-bg)",
          color: "var(--t-text)",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
        }
      : {
          backgroundColor: "var(--t-bg)",
          color: "var(--t-text)",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
        };

  return (
    <button
      className={cn(
        "px-4 py-2 font-semibold text-[0.95rem] cursor-pointer",
        "border-[2px]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-none select-none",
        className
      )}
      style={{
        fontFamily: "var(--t-font-body)",
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
