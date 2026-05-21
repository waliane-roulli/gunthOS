import type { AppManifest } from "@/types";
import { SettingsApp } from "./index";

export const manifest: AppManifest = {
  slug: "settings",
  name: "Paramètres GunthOS",
  description: "Personnalisez votre expérience GunthOS™",
  emoji: "⚙️",
  loadDuration: 700,
  showInLauncher: false,
  component: SettingsApp,
};
