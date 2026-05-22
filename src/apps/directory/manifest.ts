import type { AppManifest } from "@/types";
import { DirectoryApp } from "./index";

export const manifest: AppManifest = {
  slug: "directory",
  name: "Annuaire",
  description: "Tous les utilisateurs GunthOS",
  emoji: "📋",
  loadDuration: 1700,
  showInLauncher: true,
  badge: "NEW",
  href: "/directory",
  component: DirectoryApp,
};
