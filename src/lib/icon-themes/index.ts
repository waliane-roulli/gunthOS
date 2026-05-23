export type { IconThemeId, IconTheme, IconThemeEntry, IconRenderer, IconThemeStyle } from "./types";

import type { IconThemeId, IconTheme } from "./types";
import { emojiTheme } from "./themes/emoji";
import { lucideTheme } from "./themes/lucide";
import { win98Theme } from "./themes/win98";

export { emojiTheme, lucideTheme, win98Theme };

export const ICON_THEMES: IconTheme[] = [lucideTheme, win98Theme, emojiTheme];

export const DEFAULT_ICON_THEME_ID: IconThemeId = "lucide";

const ICON_THEME_MAP = new Map<IconThemeId, IconTheme>(
  ICON_THEMES.map((t) => [t.id, t])
);

export function getIconTheme(id: IconThemeId | undefined): IconTheme {
  return ICON_THEME_MAP.get(id as IconThemeId) ?? lucideTheme;
}
