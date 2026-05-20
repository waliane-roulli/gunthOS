import { cn } from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef } from "react";

interface RetroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: "empty" | "duplicate" | null;
}

export const RetroInput = forwardRef<HTMLInputElement, RetroInputProps>(
  function RetroInput({ error, className, style, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "flex-1 px-3 py-2 text-base outline-none border-[2px]",
          className
        )}
        style={{
          fontFamily: "var(--t-font-body)",
          backgroundColor: error === "empty"
            ? "#ffeaea"
            : error === "duplicate"
            ? "#fff4d0"
            : "var(--t-card-bg)",
          color: "var(--t-text)",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
          ...style,
        }}
        {...props}
      />
    );
  }
);
