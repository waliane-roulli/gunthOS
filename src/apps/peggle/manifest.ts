import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const PeggleApp = lazy(
  () => import("./index").then((m) => ({ default: m.PeggleApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "peggle",
  name: "Peggle 98",
  description: "Lancez des billes, détruisez des pegs !",
  emoji: "🎯",
  version: "1.2.0",
  defaultSize: { w: 520, h: 640 },
  loadDuration: 1800,
  showInLauncher: true,
  component: PeggleApp,
  audioChannels: ["peggle-music"],
};
