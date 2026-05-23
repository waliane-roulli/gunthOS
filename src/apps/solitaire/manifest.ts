import type { AppManifest } from "@/types";
import { SolitaireApp } from "./index";

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
