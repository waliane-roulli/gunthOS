import type { AppManifest } from "@/types";
import { PrinterApp } from "./index";

export const manifest: AppManifest = {
  slug: "printer",
  name: "GunthPrint 3000™",
  description: "Imprimante hors ligne depuis 2003",
  emoji: "🖨️",
  version: "1.0.0",
  loadDuration: 1500,
  showInLauncher: false,
  component: PrinterApp,
};
