import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const GunthrankApp = lazy(
  () => import("./index").then((m) => ({ default: m.GunthrankApp })),
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "gunthrank",
  name: "Kiffothèque",
  description: "Classe tes jeux du Kiff de Diamant au Caca d'Or !",
  emoji: "🏆",
  version: "1.0.0",
  defaultSize: { w: 950, h: 750 },
  loadDuration: 1800,
  showInLauncher: true,
  component: GunthrankApp,
};
