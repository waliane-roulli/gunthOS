import type { AppManifest } from "@/types";
import { LinkedGunthApp } from "./index";

export const manifest: AppManifest = {
  slug: "linked-gunth",
  name: "LinkedGunth™",
  description: "Le réseau professionnel du futur",
  emoji: "🔗",
  version: "1.0.0",
  loadDuration: 1800,
  showInLauncher: true,
  requiresAuth: true,
  component: LinkedGunthApp,
  defaultSize: { w: 860, h: 600 },
};
