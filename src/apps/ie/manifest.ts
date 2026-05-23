import type { AppManifest } from "@/types";
import { IEApp } from "./index";

export const manifest: AppManifest = {
  slug: "ie",
  name: "Internet Explorer 6",
  description: "Navigation sécurisée (certificat expiré en 2004)",
  emoji: "🌐",
  version: "1.0.0",
  loadDuration: 2000,
  showInLauncher: false,
  component: IEApp,
};
