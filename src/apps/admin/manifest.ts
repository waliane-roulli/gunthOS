import type { AppManifest } from "@/types";
import { DbAdmin } from "./index";

export const manifest: AppManifest = {
  slug: "admin",
  name: "Admin",
  emoji: "🗄️",
  description: "Administration de GunthOS",
  component: DbAdmin,
  defaultSize: { w: 1100, h: 720 },
  loadDuration: 600,
  showInLauncher: true,
};
