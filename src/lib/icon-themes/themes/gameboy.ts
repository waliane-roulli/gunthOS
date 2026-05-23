import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const gameboyTheme: IconTheme = {
  ...lucideTheme,
  id: "gameboy",
  displayName: "Game Boy",
  description: "Palette monochrome LCD olive, style Game Boy DMG-01",
  preview: "🕹️",
  style: "gameboy",
};
