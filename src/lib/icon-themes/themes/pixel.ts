import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const pixelTheme: IconTheme = {
  ...lucideTheme,
  id: "pixel",
  displayName: "Pixel",
  description: "Icônes chunky style jeu vidéo 16-bit, contour noir épais",
  preview: "👾",
  style: "pixel",
};
