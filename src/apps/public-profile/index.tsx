"use client";

import { PublicProfileApp } from "@/components/ui/profile-app";
import type { AppProps } from "@/types";

export function PublicProfileWindow({ windowId }: AppProps) {
  const username = windowId.startsWith("profile:") ? windowId.slice("profile:".length) : windowId;
  return <PublicProfileApp username={username} />;
}
