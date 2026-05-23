import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const MyComputerApp = lazy(
  () => import("./index").then((m) => ({ default: m.MyComputerApp }))
) as ComponentType<AppProps>;

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
