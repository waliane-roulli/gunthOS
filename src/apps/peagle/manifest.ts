import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const PeagleApp = lazy(
  () => import("./index").then((m) => ({ default: m.PeagleApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "peagle",
  name: "Peagle 98",
  description: "Lancez des œufs, détruisez des pegs !",
  emoji: "🦅",
  version: "2.0.0",
  defaultSize: { w: 700, h: 820 },
  loadDuration: 1800,
  showInLauncher: true,
  component: PeagleApp,
  audioChannels: ["peagle-music"],
};
