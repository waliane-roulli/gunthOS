import type { AppManifest } from "@/types";
import { TrashApp } from "./index";

export const manifest: AppManifest = {
  slug: "trash",
  name: "Corbeille",
  description: "47 éléments — Espace occupé : 11,4 Go",
  emoji: "🗑️",
  loadDuration: 600,
  showInLauncher: false,
  component: TrashApp,
};
