import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const SolitaireApp = lazy(
  () => import("./index").then((m) => ({ default: m.SolitaireApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "solitaire",
  name: "Solitaire GunthOS™",
  description: "Le jeu de cartes le plus perdu du monde",
  emoji: "🃏",
  version: "0.8.0",
  loadDuration: 1300,
  showInLauncher: false,
  component: SolitaireApp,
};
