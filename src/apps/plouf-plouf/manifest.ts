import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const PloufPloufApp = lazy(
  () => import("./index").then((m) => ({ default: m.PloufPloufApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "plouf-plouf",
  name: "Plouf Plouf",
  description: "Tirage au sort façon Web 1.0",
  emoji: "💧",
  version: "1.0.0",
  loadDuration: 1600,
  showInLauncher: true,
  defaultSize: { w: 720, h: 9999 },
  href: "/plouf-plouf",
  hot: true,
  audioChannels: ["ploufplouf-music"],
  component: PloufPloufApp,
};
