import { APP_META } from "@/lib/app-meta";
import type { IconTheme, IconRenderer } from "../types";

function makeEmojiRenderer(emoji: string): IconRenderer {
  const EmojiIcon = ({ size }: { size: number }) => (
    <span style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-flex" }}>
      {emoji}
    </span>
  );
  EmojiIcon.displayName = "EmojiIcon";
  return EmojiIcon;
}

const FallbackIcon: IconRenderer = ({ size }: { size: number }) => (
  <span style={{ fontSize: size * 0.85, lineHeight: 1, display: "inline-flex" }}>📦</span>
);
FallbackIcon.displayName = "EmojiFallback";

const icons: IconTheme["icons"] = {};
for (const app of APP_META) {
  if (app.emoji) {
    icons[app.slug] = { icon: makeEmojiRenderer(app.emoji) };
  }
}

export const emojiTheme: IconTheme = {
  id: "emoji",
  displayName: "Emoji",
  description: "Icônes emoji classiques",
  preview: "😊",
  style: "plain",
  icons,
  fallback: FallbackIcon,
};
