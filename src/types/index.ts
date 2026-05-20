import type { Route } from "next";

export interface App {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  href: Route;
  badge?: string;
}
