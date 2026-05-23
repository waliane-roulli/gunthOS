import type { ComponentType } from "react";

export type IconThemeId =
  | "emoji" | "lucide" | "win98" | "pixel" | "neon" | "crt" | "flat"
  | "pastel" | "glass" | "synthwave"
  | "aqua" | "gameboy" | "blueprint" | "candy" | "vintage";

export type IconRenderer = ComponentType<{ size: number }>;

export type IconThemeStyle =
  | "plain" | "colored-bg" | "win98" | "pixel" | "neon" | "crt" | "flat"
  | "pastel" | "glass" | "synthwave"
  | "aqua" | "gameboy" | "blueprint" | "candy" | "vintage";

export interface IconThemeEntry {
  icon: IconRenderer;
  color?: string;
  bgColor?: string;
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
