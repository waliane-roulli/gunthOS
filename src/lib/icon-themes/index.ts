export type { IconThemeId, IconTheme, IconThemeEntry, IconRenderer, IconThemeStyle } from "./types";

import type { IconThemeId, IconTheme } from "./types";
import { emojiTheme } from "./themes/emoji";
import { lucideTheme } from "./themes/lucide";
import { win98Theme } from "./themes/win98";
import { pixelTheme } from "./themes/pixel";
import { neonTheme } from "./themes/neon";
import { crtTheme } from "./themes/crt";
import { flatTheme } from "./themes/flat";
import { pastelTheme } from "./themes/pastel";
import { glassTheme } from "./themes/glass";
import { synthwaveTheme } from "./themes/synthwave";
import { aquaTheme } from "./themes/aqua";
import { gameboyTheme } from "./themes/gameboy";
import { blueprintTheme } from "./themes/blueprint";
import { candyTheme } from "./themes/candy";
import { vintageTheme } from "./themes/vintage";

export {
  emojiTheme, lucideTheme, win98Theme, pixelTheme,
  neonTheme, crtTheme, flatTheme,
  pastelTheme, glassTheme, synthwaveTheme,
  aquaTheme, gameboyTheme, blueprintTheme, candyTheme, vintageTheme,
};

export const ICON_THEMES: IconTheme[] = [
  emojiTheme,
  win98Theme,
  pixelTheme,
  lucideTheme,
  pastelTheme,
  aquaTheme,
  candyTheme,
  glassTheme,
  neonTheme,
  synthwaveTheme,
  gameboyTheme,
  crtTheme,
  blueprintTheme,
  vintageTheme,
  flatTheme,
];

export const DEFAULT_ICON_THEME_ID: IconThemeId = "emoji";

const ICON_THEME_MAP = new Map<IconThemeId, IconTheme>(
  ICON_THEMES.map((t) => [t.id, t])
);

export function getIconTheme(id: IconThemeId | undefined): IconTheme {
  return ICON_THEME_MAP.get(id as IconThemeId) ?? emojiTheme;
}
