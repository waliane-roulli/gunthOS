"use client";

import { WindowManagerProvider } from "@/lib/contexts/window-manager-context";
import { OsDesktop } from "./os-desktop";
import { Taskbar } from "./taskbar";
import { WindowLayer } from "./window-layer";
import { GunthTitle } from "./gunth-title";

export function SiteShell({ children: _children }: { children?: React.ReactNode }) {
  return (
    <WindowManagerProvider>
      <GunthTitle />
      <div className="fixed inset-0 flex flex-col overflow-hidden">
        {/* Taskbar at the top */}
        <Taskbar />

        {/* Desktop area */}
        <OsDesktop />

        {/* Floating windows */}
        <WindowLayer />
      </div>
    </WindowManagerProvider>
  );
}
