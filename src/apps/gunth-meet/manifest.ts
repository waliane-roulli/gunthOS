import { lazy, type ComponentType } from "react";
import type { AppManifest, AppProps } from "@/types";

const GunthMeetApp = lazy(
  () => import("./index").then((m) => ({ default: m.GunthMeetApp }))
) as ComponentType<AppProps>;

export const manifest: AppManifest = {
  slug: "gunth-meet",
  name: "GunthMeet™",
  description: "Visioconférence P2P — audio, vidéo, partage d'écran",
  emoji: "📹",
  version: "1.0.0",
  loadDuration: 1200,
  showInLauncher: true,
  defaultSize: { w: 900, h: 580 },
  audioChannels: ["gunth-meet-ambiance"],
  component: GunthMeetApp,
};
