import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface RetroTitlebarBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  close?: boolean;
  isActive?: boolean;
}

export function RetroTitlebarBtn({
  size = 22,
  close = false,
  isActive = true,
  className,
  children,
  style,
  ...props
}: RetroTitlebarBtnProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center text-xs font-bold border-[2px] cursor-pointer select-none shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: close && isActive ? "#cc2222" : "var(--t-bg)",
        color: close && isActive ? "#fff" : "var(--t-text)",
        fontFamily: "var(--t-font-display)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
