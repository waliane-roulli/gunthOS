import type { AppManifest } from "@/types";
import { RadioApp } from "./index";

export const manifest: AppManifest = {
  slug: "radio",
  name: "GunthRadio™",
  description: "Fréquence Groove — 6 stations, 0 pub",
  emoji: "📻",
  version: "1.0.0",
  loadDuration: 2200,
  showInLauncher: true,
  href: "/radio",
  hot: true,
  component: RadioApp,
  persistAudio: true,
};
