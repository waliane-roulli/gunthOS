import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const NotepadApp = lazy(
  () => import("./index").then((m) => ({ default: m.NotepadApp }))
) as ComponentType<AppProps>;

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
