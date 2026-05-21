import type { AppManifest } from "@/types";
import { PublicProfileWindow } from "./index";

export const manifest: AppManifest = {
  slug: "public-profile",
  name: "Profil",
  description: "Fiche profil d'un utilisateur GunthOS",
  emoji: "👤",
  loadDuration: 1400,
  showInLauncher: false,
  component: PublicProfileWindow,
};
