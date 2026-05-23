import type { IconTheme, IconRenderer } from "../types";

const EMOJI_MAP: Record<string, string> = {
  peggle: "🎯",
  "plouf-plouf": "💧",
  profile: "👤",
  directory: "📋",
  msn: "💬",
  radio: "📻",
  "linked-gunth": "🔗",
  "gunther-board": "📝",
  admin: "🗄️",
  "my-computer": "🖥️",
  trash: "🗑️",
  settings: "⚙️",
  login: "🔐",
  "public-profile": "👤",
  solitaire: "🃏",
  defrag: "🗂️",
  notepad: "📝",
  printer: "🖨️",
  ie: "🌐",
};

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
for (const [slug, emoji] of Object.entries(EMOJI_MAP)) {
  icons[slug] = { icon: makeEmojiRenderer(emoji) };
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
