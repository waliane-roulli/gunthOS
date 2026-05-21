"use client";

import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { LoginWindow } from "@/components/ui/login-window";
import type { AppProps } from "@/types";

export function LoginApp({ windowId }: AppProps) {
  const { closeWindow } = useWindowManager();
  return <LoginWindow onClose={() => closeWindow(windowId)} />;
}
