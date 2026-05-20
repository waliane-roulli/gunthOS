"use client";

import { useState } from "react";
import { WindowManagerProvider } from "@/lib/contexts/window-manager-context";
import { OsDesktop } from "./os-desktop";
import { Taskbar } from "./taskbar";
import { WindowLayer } from "./window-layer";
import { GunthTitle } from "./gunth-title";
import { BootScreen } from "./boot-screen";

export function SiteShell({ children: _children }: { children?: React.ReactNode }) {
  const [bootKey, setBootKey] = useState(0);
  const [booted, setBooted] = useState(false);

  const handleReboot = () => {
    setBooted(false);
    setBootKey((k) => k + 1);
  };

  return (
    <>
      {!booted && <BootScreen key={bootKey} onComplete={() => setBooted(true)} />}
      <WindowManagerProvider>
        <GunthTitle />
        <div className="fixed inset-0 flex flex-col overflow-hidden">
          <Taskbar onReboot={handleReboot} />
          <OsDesktop />
          <WindowLayer />
        </div>
      </WindowManagerProvider>
    </>
  );
}
