import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const ChangelogApp = lazy(
  () => import("./index").then((m) => ({ default: m.ChangelogApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "changelog",
  name: "Notes de version",
  description: "Historique des mises à jour GunthOS",
  emoji: "📋",
  version: "1.0.0",
  defaultSize: { w: 520, h: 560 },
  loadDuration: 400,
  showInLauncher: false,
  component: ChangelogApp,
};
