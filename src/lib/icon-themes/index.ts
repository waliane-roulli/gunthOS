export type { IconThemeId, IconTheme, IconThemeEntry, IconRenderer, IconThemeStyle } from "./types";

import type { IconThemeId, IconTheme } from "./types";
import { emojiTheme } from "./themes/emoji";
import { lucideTheme } from "./themes/lucide";
import { win98Theme } from "./themes/win98";
import { pixelTheme } from "./themes/pixel";
import { neonTheme } from "./themes/neon";
import { crtTheme } from "./themes/crt";
import { flatTheme } from "./themes/flat";

export { emojiTheme, lucideTheme, win98Theme, pixelTheme, neonTheme, crtTheme, flatTheme };

export const ICON_THEMES: IconTheme[] = [
  win98Theme,
  pixelTheme,
  lucideTheme,
  neonTheme,
  crtTheme,
  flatTheme,
  emojiTheme,
];

export const DEFAULT_ICON_THEME_ID: IconThemeId = "win98";

const ICON_THEME_MAP = new Map<IconThemeId, IconTheme>(
  ICON_THEMES.map((t) => [t.id, t])
);

export function getIconTheme(id: IconThemeId | undefined): IconTheme {
  return ICON_THEME_MAP.get(id as IconThemeId) ?? win98Theme;
}
