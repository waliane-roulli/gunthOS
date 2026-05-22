import type { AppManifest } from "@/types";
import { PeggleApp } from "./index";

export const manifest: AppManifest = {
  slug: "peggle",
  name: "Peggle 98",
  description: "Lancez des billes, détruisez des pegs !",
  emoji: "🎯",
  defaultSize: { w: 520, h: 640 },
  loadDuration: 1800,
  showInLauncher: true,
  component: PeggleApp,
  audioChannels: ["peggle-music"],
};
