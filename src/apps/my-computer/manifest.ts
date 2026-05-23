import type { AppManifest } from "@/types";
import { MyComputerApp } from "./index";

export const manifest: AppManifest = {
  slug: "my-computer",
  name: "Mon Ordinateur",
  description: "Propriété de Gunth Corp™",
  emoji: "🖥️",
  version: "0.5.0",
  loadDuration: 1000,
  showInLauncher: false,
  component: MyComputerApp,
};
