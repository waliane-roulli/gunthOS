import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const TrashApp = lazy(
  () => import("./index").then((m) => ({ default: m.TrashApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "trash",
  name: "Corbeille",
  description: "47 éléments — Espace occupé : 11,4 Go",
  emoji: "🗑️",
  loadDuration: 600,
  showInLauncher: false,
  component: TrashApp,
};
