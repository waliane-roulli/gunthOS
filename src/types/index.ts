import type { ReactNode, ComponentType } from "react";

export interface App {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  iconNode?: ReactNode;
  href: string;
  badge?: string;
}

export interface AppManifest {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  iconNode?: ReactNode;
  /** Default window size in pixels */
  defaultSize?: { w: number; h: number };
  /** Fake loading duration in ms (default: 1500) */
  loadDuration?: number;
  /** Show in Start menu and desktop */
  showInLauncher?: boolean;
  /** Optional Next.js page route (for nav-bar / direct URL access) */
  href?: string;
  /** Optional badge text ("NEW", "3", etc.) */
  badge?: string;
  /** The React component rendered inside the window */
  component: ComponentType<AppProps>;
}

export interface AppProps {
  windowId: string;
}
