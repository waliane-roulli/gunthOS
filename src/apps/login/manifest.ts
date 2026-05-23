import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const LoginApp = lazy(
  () => import("./index").then((m) => ({ default: m.LoginApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "login",
  name: "Connexion GunthOS",
  description: "Authentification utilisateur",
  emoji: "🔐",
  loadDuration: 900,
  showInLauncher: false,
  component: LoginApp,
};
