import type { AppManifest } from "@/types";
import { MsnLogo } from "@/components/ui/msn-logo";
import { MsnApp } from "./index";

export const manifest: AppManifest = {
  slug: "msn",
  name: "GunthMessenger™",
  description: "Messagerie instantanée style MSN",
  emoji: "💬",
  version: "1.0.0",
  iconComponent: MsnLogo,
  loadDuration: 1200,
  showInLauncher: true,
  href: "/msn",
  requiresAuth: true,
  component: MsnApp,
};
