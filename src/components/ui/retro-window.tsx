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
        "border-[3px] shadow-[6px_6px_0_rgba(0,0,0,0.35)]",
        shaking && "animate-shake",
        className
      )}
      style={{
        backgroundColor: "var(--t-bg)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-dark)",
      }}
    >
      <div
        className="px-[10px] py-[6px] flex justify-between items-center border-b-2 border-black tracking-wider text-sm"
        style={{
          background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
          color: "var(--t-titlebar-text)",
          fontFamily: "var(--t-font-display)",
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
