import type { AppManifest } from "@/types";
import { PloufPloufApp } from "./index";

export const manifest: AppManifest = {
  slug: "plouf-plouf",
  name: "Plouf Plouf",
  description: "Tirage au sort façon Web 1.0",
  emoji: "💧",
  loadDuration: 1600,
  showInLauncher: true,
  href: "/plouf-plouf",
  badge: "NEW",
  audioChannels: ["music"],
  component: PloufPloufApp,
};
