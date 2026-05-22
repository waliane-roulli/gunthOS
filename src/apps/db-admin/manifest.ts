import type { AppManifest } from "@/types";
import { DbAdmin } from "./index";

export const manifest: AppManifest = {
  slug: "db-admin",
  name: "DB Admin",
  emoji: "🗄️",
  description: "Drizzle Studio — administration de la base de données",
  component: DbAdmin,
  defaultSize: { w: 1100, h: 720 },
  loadDuration: 600,
  showInLauncher: true,
};
