import type { AppManifest } from "@/types";
import { PloufPloufApp } from "./index";

export const manifest: AppManifest = {
  slug: "plouf-plouf",
  name: "Plouf Plouf",
  description: "Tirage au sort façon Web 1.0",
  emoji: "💧",
  version: "1.0.0",
  loadDuration: 1600,
  showInLauncher: true,
  defaultSize: { w: 720, h: 9999 },
  href: "/plouf-plouf",
  hot: true,
  audioChannels: ["music"],
  component: PloufPloufApp,
};
