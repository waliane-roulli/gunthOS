import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const crtTheme: IconTheme = {
  ...lucideTheme,
  id: "crt",
  displayName: "Terminal CRT",
  description: "Phosphore vert monochrome, style console rétro",
  preview: "📟",
  style: "crt",
};
