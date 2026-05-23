import type { AppManifest } from "@/types";
import { DirectoryApp } from "./index";

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
