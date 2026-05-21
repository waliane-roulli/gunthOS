import type { AppManifest } from "@/types";
import { RadioApp } from "./index";

export const manifest: AppManifest = {
  slug: "radio",
  name: "GunthRadio™",
  description: "Fréquence Groove — 6 stations, 0 pub",
  emoji: "📻",
  loadDuration: 2200,
  showInLauncher: true,
  href: "/radio",
  badge: "NEW",
  component: RadioApp,
  persistAudio: true,
};
