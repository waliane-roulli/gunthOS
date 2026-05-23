"use client";

import { useIconTheme } from "@/lib/contexts/icon-theme-context";

interface OsIconProps {
  slug: string;
  size: number;
  className?: string;
}

export function OsIcon({ slug, size, className }: OsIconProps) {
  const theme = useIconTheme();
  const entry = theme.icons[slug];
  const Renderer = entry?.icon ?? theme.fallback;

  if (theme.style === "colored-bg") {
    const color = entry?.color ?? "var(--t-accent)";
    const iconSize = Math.round(size * 0.6);
    const border = size >= 28 ? "2px" : "1px";
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderTop: `${border} solid var(--t-border-light)`,
          borderLeft: `${border} solid var(--t-border-light)`,
          borderBottom: `${border} solid var(--t-border-dark)`,
          borderRight: `${border} solid var(--t-border-dark)`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "win98") {
    const iconSize = Math.round(size * 0.68);
    const color = entry?.color ?? "var(--t-text)";
    const border = size >= 28 ? "2px" : "1px";
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          backgroundColor: "var(--t-bg)",
          color,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderTop: `${border} solid var(--t-border-light)`,
          borderLeft: `${border} solid var(--t-border-light)`,
          borderBottom: `${border} solid var(--t-border-dark)`,
          borderRight: `${border} solid var(--t-border-dark)`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (className) {
    return <span className={className} style={{ display: "inline-flex" }}><Renderer size={size} /></span>;
  }
  return <Renderer size={size} />;
}
