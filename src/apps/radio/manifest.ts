import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const RadioApp = lazy(
  () => import("./index").then((m) => ({ default: m.RadioApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "radio",
  name: "GunthRadio™",
  description: "Fréquence Groove — 6 stations, 0 pub",
  emoji: "📻",
  version: "1.0.0",
  loadDuration: 2200,
  showInLauncher: true,
  href: "/radio",
  hot: true,
  component: RadioApp,
  persistAudio: true,
};
