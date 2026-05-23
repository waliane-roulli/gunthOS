import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const DbAdmin = lazy(
  () => import("./index").then((m) => ({ default: m.DbAdmin }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "admin",
  name: "Admin",
  emoji: "🗄️",
  version: "1.2.0",
  description: "Administration de GunthOS",
  component: DbAdmin,
  defaultSize: { w: 1100, h: 720 },
  loadDuration: 600,
  showInLauncher: true,
};
