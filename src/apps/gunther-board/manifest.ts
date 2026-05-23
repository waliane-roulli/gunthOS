import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const GuntherBoardApp = lazy(
  () => import("./index").then((m) => ({ default: m.GuntherBoardApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "gunther-board",
  name: "GuntherBoard",
  description: "Issue tracker™ — tickets perdus depuis 2003",
  emoji: "📝",
  version: "1.1.0",
  defaultSize: { w: 900, h: 620 },
  loadDuration: 1000,
  showInLauncher: true,
  requiresAuth: true,
  component: GuntherBoardApp
};
