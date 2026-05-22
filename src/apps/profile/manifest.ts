import type { AppManifest } from "@/types";
import { ProfileApp } from "./index";

export const manifest: AppManifest = {
  slug: "profile",
  name: "Mon Profil",
  description: "Votre fiche GunthOS™",
  emoji: "👤",
  loadDuration: 1400,
  showInLauncher: true,
  badge: "NEW",
  href: "/profile",
  component: ProfileApp,
};
