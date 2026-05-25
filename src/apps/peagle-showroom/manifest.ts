import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const PeagleShowroomApp = lazy(
  () => import("./index").then((m) => ({ default: m.PeagleShowroomApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "peagle-showroom",
  name: "Peagle Showroom",
  description: "Assets et thèmes visuels de Peagle 98",
  emoji: "🎨",
  version: "1.0.0",
  defaultSize: { w: 480, h: 700 },
  loadDuration: 400,
  showInLauncher: false,
  component: PeagleShowroomApp,
};
