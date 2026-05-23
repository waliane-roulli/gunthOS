"use client";

import { useEffect, useRef } from "react";
import { useNotify } from "@/lib/contexts/notification-context";

const SW_KEY = "pwa-sw-registered";
const INSTALL_PROMPTED_KEY = "pwa-install-prompted";

export function PwaInstallPrompt() {
  const notify = useNotify();
  const notified = useRef(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && !localStorage.getItem(SW_KEY)) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        localStorage.setItem(SW_KEY, "1");
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (notified.current) return;
    if (localStorage.getItem(INSTALL_PROMPTED_KEY)) return;

    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);
    if (isStandalone) return;

    // Wait for the beforeinstallprompt event (Chrome/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      notified.current = true;
      localStorage.setItem(INSTALL_PROMPTED_KEY, "1");
      notify({
        type: "info",
        title: "Installer GunthOS",
        message: "Ajoutez GunthOS à votre écran d'accueil depuis le menu de votre navigateur.",
        duration: 8000,
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall, { once: true });

    // iOS Safari: no beforeinstallprompt — show after a delay if not already prompted
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      const t = setTimeout(() => {
        if (notified.current) return;
        notified.current = true;
        localStorage.setItem(INSTALL_PROMPTED_KEY, "1");
        notify({
          type: "info",
          title: "Installer GunthOS",
          message: 'Sur iOS : appuyez sur Partager puis "Sur l\'écran d\'accueil".',
          duration: 8000,
        });
      }, 3000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [notify]);

  return null;
}
