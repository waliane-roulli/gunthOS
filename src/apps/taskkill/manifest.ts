import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const TaskkillApp = lazy(
  () => import("./index").then((m) => ({ default: m.TaskkillApp })),
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "taskkill",
  name: "TASKKILL.EXE",
  description: "The Bloatware Purge — nettoyez GunthOS à la sulfateuse",
  emoji: "🎮",
  version: "1.0.0",
  defaultSize: { w: 860, h: 560 },
  loadDuration: 2200,
  showInLauncher: true,
  component: TaskkillApp,
  audioChannels: ["taskkill-sfx"],
};
