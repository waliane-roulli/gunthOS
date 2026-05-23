"use client";

import { useIconTheme } from "@/lib/contexts/icon-theme-context";
import type { IconRenderer } from "@/lib/icon-themes/types";

interface OsIconProps {
  slug: string;
  size: number;
  className?: string;
}

interface BoxedIconProps {
  size: number;
  bgColor: string;
  iconColor: string;
  iconRatio: number;
  border: string;
  className?: string;
  Renderer: IconRenderer;
  extraStyle?: React.CSSProperties;
}

function BoxedIcon({ size, bgColor, iconColor, iconRatio, border, className, Renderer, extraStyle }: BoxedIconProps) {
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        backgroundColor: bgColor,
        color: iconColor,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        borderTop: `${border} solid var(--t-border-light)`,
        borderLeft: `${border} solid var(--t-border-light)`,
        borderBottom: `${border} solid var(--t-border-dark)`,
        borderRight: `${border} solid var(--t-border-dark)`,
        ...extraStyle,
      }}
    >
      <Renderer size={Math.round(size * iconRatio)} />
    </div>
  );
}

export function OsIcon({ slug, size, className }: OsIconProps) {
  const theme = useIconTheme();
  const entry = theme.icons[slug];
  const Renderer = entry?.icon ?? theme.fallback;
  const color = entry?.color ?? "var(--t-accent)";
  const border = size >= 28 ? "2px" : "1px";

  if (theme.style === "colored-bg") {
    return <BoxedIcon size={size} bgColor={color} iconColor="white" iconRatio={0.6} border={border} className={className} Renderer={Renderer} />;
  }

  if (theme.style === "win98") {
    return <BoxedIcon size={size} bgColor="var(--t-bg)" iconColor={color} iconRatio={0.68} border={border} className={className} Renderer={Renderer} />;
  }

  if (theme.style === "pixel") {
    const iconSize = Math.round(size * 0.62);
    const outline = Math.max(2, Math.round(size * 0.06));
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: color,
          color: "white",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          outline: `${outline}px solid #000`,
          outlineOffset: `-${outline}px`,
          boxShadow: `${outline}px ${outline}px 0 #000, -${outline}px -${outline}px 0 rgba(255,255,255,0.35) inset`,
          imageRendering: "pixelated",
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "neon") {
    const iconSize = Math.round(size * 0.62);
    const glow = Math.round(size * 0.5);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: "#060810",
          color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${color}`,
          boxShadow: `0 0 ${glow}px ${color}55, inset 0 0 ${Math.round(glow * 0.4)}px ${color}22`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "crt") {
    const iconSize = Math.round(size * 0.62);
    const glow = Math.round(size * 0.4);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: "#001800",
          color: "#00ff41",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: "1px solid #00ff41",
          boxShadow: `0 0 ${glow}px #00ff4155, inset 0 0 ${Math.round(glow * 0.4)}px #00ff4122`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "flat") {
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Renderer size={size} />
      </div>
    );
  }

  // plain (emoji)
  if (className) {
    return <span className={className} style={{ display: "inline-flex" }}><Renderer size={size} /></span>;
  }
  return <Renderer size={size} />;
}
