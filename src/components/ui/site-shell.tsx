"use client";

import { useState } from "react";
import { WindowManagerProvider } from "@/lib/contexts/window-manager-context";
import { SoundProvider } from "@/lib/contexts/sound-context";
import { RadioProvider } from "@/lib/contexts/radio-context";
import { SeenAppsProvider } from "@/lib/contexts/seen-apps-context";
import { OsDesktop } from "./os-desktop";
import { Taskbar } from "./taskbar";
import { WindowLayer } from "./window-layer";
import { NotificationLayer } from "./notification-layer";
import { GunthTitle } from "./gunth-title";
import { BootScreen, ShutdownScreen } from "./boot-screen";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { UnreadProvider } from "@/lib/contexts/unread-context";
import { useLiveNotifications } from "@/lib/hooks/use-live-notifications";

function LiveNotificationsBridge() {
  useLiveNotifications();
  return null;
}

export function SiteShell({ children: _children }: { children?: React.ReactNode }) {
  const [bootKey, setBootKey] = useState(0);
  const [booted, setBooted] = useState(false);
  const [shutdown, setShutdown] = useState(false);

  const handleReboot = () => {
    setShutdown(false);
    setBooted(false);
    setBootKey((k) => k + 1);
  };

  const handleShutdown = () => {
    setShutdown(true);
  };

  return (
    <SoundProvider>
      {shutdown && <ShutdownScreen onPowerOn={handleReboot} />}
      {!booted && !shutdown && <BootScreen key={bootKey} onComplete={() => setBooted(true)} />}
      <RadioProvider>
        <SeenAppsProvider>
          <WindowManagerProvider>
            <NotificationProvider>
              <UnreadProvider>
                <LiveNotificationsBridge />
                <GunthTitle />
                <div className="fixed inset-0 flex flex-col overflow-hidden scanlines">
                  <Taskbar onReboot={handleReboot} onShutdown={handleShutdown} />
                  <OsDesktop />
                  <WindowLayer />
                  <NotificationLayer />
                </div>
              </UnreadProvider>
            </NotificationProvider>
          </WindowManagerProvider>
        </SeenAppsProvider>
      </RadioProvider>
    </SoundProvider>
  );
}
