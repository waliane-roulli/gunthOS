import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const blueprintTheme: IconTheme = {
  ...lucideTheme,
  id: "blueprint",
  displayName: "Blueprint",
  description: "Plan technique sur fond bleu cobalt, tracé blanc",
  preview: "📐",
  style: "blueprint",
};
