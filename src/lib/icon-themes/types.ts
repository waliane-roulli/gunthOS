import type { ComponentType } from "react";

export type IconThemeId = "emoji" | "lucide" | "win98";

export type IconRenderer = ComponentType<{ size: number }>;

export type IconThemeStyle = "plain" | "colored-bg" | "win98";

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
