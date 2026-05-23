import type { AppManifest } from "@/types";
import { NotepadApp } from "./index";

export const manifest: AppManifest = {
  slug: "notepad",
  name: "Bloc-notes",
  description: "Éditeur de texte GunthOS (données non garanties)",
  emoji: "📝",
  version: "1.0.0",
  loadDuration: 800,
  showInLauncher: false,
  component: NotepadApp,
};
