import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const flatTheme: IconTheme = {
  ...lucideTheme,
  id: "flat",
  displayName: "Flat",
  description: "Icône SVG colorée, sans fond ni bordure",
  preview: "🎨",
  style: "flat",
};
