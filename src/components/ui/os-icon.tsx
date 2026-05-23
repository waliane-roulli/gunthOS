"use client";

import { useIconTheme } from "@/lib/contexts/icon-theme-context";
import type { IconRenderer, IconTheme } from "@/lib/icon-themes/types";

interface OsIconProps {
  slug: string;
  size: number;
  className?: string;
  theme?: IconTheme;
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

export function OsIcon({ slug, size, className, theme: themeProp }: OsIconProps) {
  const contextTheme = useIconTheme();
  const theme = themeProp ?? contextTheme;
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

  if (theme.style === "pastel") {
    const bgColor = entry?.bgColor ?? "#e8e8f4";
    const iconSize = Math.round(size * 0.6);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: bgColor,
          color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          borderTop: `${border} solid rgba(255,255,255,0.9)`,
          borderLeft: `${border} solid rgba(255,255,255,0.9)`,
          borderBottom: `${border} solid rgba(0,0,0,0.12)`,
          borderRight: `${border} solid rgba(0,0,0,0.12)`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "glass") {
    const iconSize = Math.round(size * 0.62);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: `${color}28`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${color}55`,
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.5), 0 2px 8px ${color}22`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "synthwave") {
    const iconSize = Math.round(size * 0.62);
    const glow = Math.round(size * 0.45);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 100%)",
          color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${color}88`,
          boxShadow: `0 0 ${glow}px ${color}44, inset 0 0 ${Math.round(glow * 0.3)}px rgba(255,50,220,0.1)`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "aqua") {
    const iconSize = Math.round(size * 0.62);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          background: `linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.12) 52%, ${color} 100%)`,
          color: "white",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          borderRadius: "22%",
          border: `1px solid ${color}99`,
          boxShadow: `0 3px 8px ${color}55, inset 0 1px 2px rgba(255,255,255,0.95)`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "gameboy") {
    const iconSize = Math.round(size * 0.6);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: "#9bbc0f",
          color: "#0f380f",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `${border} solid #306230`,
          boxShadow: `inset 1px 1px 0 #8bac0f, inset -1px -1px 0 #306230`,
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "blueprint") {
    const iconSize = Math.round(size * 0.6);
    const gridUnit = Math.max(4, Math.round(size / 6));
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          backgroundColor: "#1a3a6e",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: `${gridUnit}px ${gridUnit}px`,
          color: "rgba(255,255,255,0.92)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1px dashed rgba(255,255,255,0.45)`,
          outline: `1px solid rgba(255,255,255,0.08)`,
          outlineOffset: "2px",
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "candy") {
    const iconSize = Math.round(size * 0.6);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.88) 0%, ${color}dd 55%, ${color} 100%)`,
          color: "white",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          borderRadius: "18%",
          boxShadow: `0 2px 6px ${color}66, inset 0 -2px 4px rgba(0,0,0,0.15)`,
          filter: "saturate(1.25)",
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  if (theme.style === "vintage") {
    const iconSize = Math.round(size * 0.6);
    return (
      <div
        className={className}
        style={{
          width: size, height: size,
          background: "linear-gradient(135deg, #e8d5a3 0%, #c9a96e 100%)",
          color: "#3d1f00",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `${border} solid #8b5e3c`,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.35), 0 1px 3px rgba(61,31,0,0.3)`,
          filter: "sepia(0.3)",
        }}
      >
        <Renderer size={iconSize} />
      </div>
    );
  }

  // plain (emoji)
  if (className) {
    return <span className={className} style={{ display: "inline-flex" }}><Renderer size={size} /></span>;
  }
  return <Renderer size={size} />;
}
