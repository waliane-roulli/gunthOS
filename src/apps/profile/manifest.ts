import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const ProfileApp = lazy(
  () => import("./index").then((m) => ({ default: m.ProfileApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "profile",
  name: "Mon Profil",
  description: "Votre fiche GunthOS™",
  emoji: "👤",
  version: "1.0.0",
  loadDuration: 1400,
  showInLauncher: true,
  href: "/profile",
  requiresAuth: true,
  component: ProfileApp,
};
