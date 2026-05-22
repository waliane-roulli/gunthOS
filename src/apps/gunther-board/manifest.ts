import type { AppManifest } from "@/types";
import { GuntherBoardApp } from "./index";

export const manifest: AppManifest = {
  slug: "gunther-board",
  name: "GuntherBoard",
  description: "Issue tracker™ — tickets perdus depuis 2003",
  emoji: "📋",
  defaultSize: { w: 900, h: 620 },
  loadDuration: 1000,
  showInLauncher: true,
  badge: "NEW",
  component: GuntherBoardApp
};
