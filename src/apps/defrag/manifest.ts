import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const DefragApp = lazy(
  () => import("./index").then((m) => ({ default: m.DefragApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "defrag",
  name: "Défragmenteur de disque",
  description: "Optimise votre disque (résultat non garanti)",
  emoji: "🗂️",
  version: "1.0.0",
  loadDuration: 0,
  showInLauncher: false,
  component: DefragApp,
};
