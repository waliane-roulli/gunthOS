import type { AppManifest } from "@/types";
import { DefragApp } from "./index";

export const manifest: AppManifest = {
  slug: "defrag",
  name: "Défragmenteur de disque",
  description: "Optimise votre disque (résultat non garanti)",
  emoji: "🗂️",
  version: "1.0.0",
  loadDuration: 1800,
  showInLauncher: false,
  component: DefragApp,
};
