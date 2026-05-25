import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const TaskkillApp = lazy(
  () => import("./index").then((m) => ({ default: m.TaskkillApp })),
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "taskkill",
  name: "dragmenteur.exe",
  description: "Dragmenteur.exe — la purge dégéntée de GunthOS. PloufPlouf, MSN, IE6, Radio, Solitaire... éliminez les apps devenues folles !",
  emoji: "🖕",
  version: "2.0.0",
  defaultSize: { w: 860, h: 560 },
  loadDuration: 2200,
  showInLauncher: true,
  component: TaskkillApp,
  audioChannels: ["taskkill-sfx"],
};
