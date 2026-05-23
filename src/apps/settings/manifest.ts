import type { AppManifest } from "@/types";
import { SettingsApp } from "./index";

export const manifest: AppManifest = {
  slug: "settings",
  name: "Paramètres GunthOS",
  description: "Personnalisez votre expérience GunthOS™",
  emoji: "⚙️",
  version: "1.0.0",
  loadDuration: 700,
  showInLauncher: false,
  component: SettingsApp,
};
