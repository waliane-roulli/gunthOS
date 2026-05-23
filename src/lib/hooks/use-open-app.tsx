"use client";

import { useCallback } from "react";
import { useWindowActions } from "@/lib/contexts/window-manager-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useSeenApps } from "@/lib/contexts/seen-apps-context";
import { getAppManifest } from "@/apps";
import { OsIcon } from "@/components/ui/os-icon";
import type { ReactNode } from "react";

/**
 * Centralise l'orchestration "ouvrir une app" :
 * init audio → son d'ouverture → création de fenêtre.
 *
 * Remplace les triplets (init, playWindowOpen, openApp/openWindow) dispersés
 * dans OsDesktop, Taskbar, etc.
 */
export function useOpenApp() {
  const { openWindow } = useWindowActions();
  const { init, playWindowOpen } = useSoundContext();
  const { markSeen } = useSeenApps();

  const openApp = useCallback(
    (slug: string): string => {
      const app = getAppManifest(slug);
      if (!app) return "";
      init();
      playWindowOpen();
      markSeen(slug);
      const icon = <OsIcon slug={app.slug} size={20} />;
      return openWindow(app.slug, app.name, icon, { startMaximized: app.startMaximized, defaultSize: app.defaultSize });
    },
    [openWindow, init, playWindowOpen, markSeen]
  );

  const openNamedWindow = useCallback(
    (slug: string, title: string, icon: ReactNode): string => {
      const app = getAppManifest(slug);
      init();
      playWindowOpen();
      return openWindow(slug, title, icon, { startMaximized: app?.startMaximized, defaultSize: app?.defaultSize });
    },
    [openWindow, init, playWindowOpen]
  );

  return { openApp, openNamedWindow };
}
