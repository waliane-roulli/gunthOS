import type { Route } from "next";
import type { ReactNode } from "react";

export interface App {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  iconNode?: ReactNode;
  href: Route;
  badge?: string;
}
