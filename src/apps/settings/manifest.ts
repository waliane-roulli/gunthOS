import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const SettingsApp = lazy(
  () => import("./index").then((m) => ({ default: m.SettingsApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "settings",
  name: "Paramètres GunthOS",
  description: "Personnalisez votre expérience GunthOS™",
  emoji: "⚙️",
  version: "1.2.0",
  loadDuration: 700,
  showInLauncher: false,
  component: SettingsApp,
};
