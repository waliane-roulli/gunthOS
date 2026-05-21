"use client";

import { useCallback } from "react";
import { useWindowActions } from "@/lib/contexts/window-manager-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { getAppManifest } from "@/apps";
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

  const openApp = useCallback(
    (slug: string): string => {
      const app = getAppManifest(slug);
      if (!app) return "";
      init();
      playWindowOpen();
      return openWindow(app.slug, app.name, app.iconNode ?? app.emoji);
    },
    [openWindow, init, playWindowOpen]
  );

  const openNamedWindow = useCallback(
    (slug: string, title: string, icon: ReactNode): string => {
      init();
      playWindowOpen();
      return openWindow(slug, title, icon);
    },
    [openWindow, init, playWindowOpen]
  );

  return { openApp, openNamedWindow };
}
