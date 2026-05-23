import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const PublicProfileWindow = lazy(
  () => import("./index").then((m) => ({ default: m.PublicProfileWindow }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "public-profile",
  name: "Profil",
  description: "Fiche profil d'un utilisateur GunthOS",
  emoji: "👤",
  loadDuration: 1400,
  showInLauncher: false,
  component: PublicProfileWindow,
};
