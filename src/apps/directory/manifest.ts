import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const DirectoryApp = lazy(
  () => import("./index").then((m) => ({ default: m.DirectoryApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "directory",
  name: "Annuaire",
  description: "Tous les utilisateurs GunthOS",
  emoji: "📋",
  version: "1.0.0",
  loadDuration: 1700,
  showInLauncher: true,
  href: "/directory",
  component: DirectoryApp,
};
