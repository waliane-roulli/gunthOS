import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";
import { MsnLogo } from "@/components/ui/msn-logo";

const MsnApp = lazy(
  () => import("./index").then((m) => ({ default: m.MsnApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "msn",
  name: "GunthMessenger™",
  description: "Messagerie instantanée style MSN",
  emoji: "💬",
  version: "1.2.0",
  iconComponent: MsnLogo,
  loadDuration: 1200,
  showInLauncher: true,
  href: "/msn",
  requiresAuth: true,
  component: MsnApp,
};
