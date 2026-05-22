import { cn } from "@/lib/utils/cn";

interface RetroWindowProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  shaking?: boolean;
  titlebarRight?: React.ReactNode;
}

export function RetroWindow({
  title,
  icon,
  children,
  className,
  shaking = false,
  titlebarRight,
}: RetroWindowProps) {
  return (
    <div
      className={cn(
        "border-[3px]",
        shaking && "animate-shake",
        className
      )}
      style={{
        backgroundColor: "var(--t-glass-bg)",
        backdropFilter: "var(--t-glass-blur)",
        WebkitBackdropFilter: "var(--t-glass-blur)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-dark)",
        borderRadius: "var(--t-window-radius)",
        boxShadow: "var(--t-window-shadow)",
        overflow: "hidden",
      }}
    >
      <div
        className="px-[10px] py-[6px] flex justify-between items-center border-b-2 border-black tracking-wider"
        style={{
          background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
          color: "var(--t-titlebar-text)",
          fontFamily: "var(--t-font-display)",
          fontSize: "var(--t-text-base)",
          borderRadius: "calc(var(--t-titlebar-radius) - 1px) calc(var(--t-titlebar-radius) - 1px) 0 0",
        }}
      >
        <span>
          {icon} {title}
        </span>
        {titlebarRight}
      </div>
      {children}
    </div>
  );
}
