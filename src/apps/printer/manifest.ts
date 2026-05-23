import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const PrinterApp = lazy(
  () => import("./index").then((m) => ({ default: m.PrinterApp }))
) as ComponentType<AppProps>;

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
