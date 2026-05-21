"use client";

import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { SettingsPanel } from "@/components/ui/settings-panel";
import type { AppProps } from "@/types";

export function SettingsApp({ windowId }: AppProps) {
  const { closeWindow } = useWindowManager();
  return (
    <div className="relative">
      <SettingsPanel onClose={() => closeWindow(windowId)} embedded />
    </div>
  );
}
