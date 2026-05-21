import type { AppManifest } from "@/types";
import { LoginApp } from "./index";

export const manifest: AppManifest = {
  slug: "login",
  name: "Connexion GunthOS",
  description: "Authentification utilisateur",
  emoji: "🔐",
  loadDuration: 900,
  showInLauncher: false,
  component: LoginApp,
};
