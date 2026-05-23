import type { ComponentType } from "react";

export type IconThemeId = "emoji" | "lucide" | "win98" | "pixel" | "neon" | "crt" | "flat";

export type IconRenderer = ComponentType<{ size: number }>;

export type IconThemeStyle = "plain" | "colored-bg" | "win98" | "pixel" | "neon" | "crt" | "flat";

export interface IconThemeEntry {
  icon: IconRenderer;
  color?: string;
}

export interface IconTheme {
  id: IconThemeId;
  displayName: string;
  description: string;
  preview: string;
  style: IconThemeStyle;
  icons: Partial<Record<string, IconThemeEntry>>;
  fallback: IconRenderer;
}
