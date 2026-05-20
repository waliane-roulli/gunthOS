export type WallpaperId =
  | "win95_default"
  | "bliss"
  | "matrix"
  | "space"
  | "pizza"
  | "cats"
  | "bsod"
  | "windows_error"
  | "doge"
  | "nyan"
  | "stonks"
  | "windows_xp_hill"
  | "vaporwave_grid"
  | "dark_souls"
  | "loading"
  | "clippy"
  | "404"
  | "dial_up"
  | "among_us"
  | "todo_list"
  | "this_is_fine"
  | "rickroll"
  | "monalisa"
  | "aquarium"
  | "lemmings"
  | "coffee"
  | "windows_update"
  | "confetti"
  | "printer"
  | "captcha"
  | "snake"
  | "tamagotchi"
  | "horaire_sncf"
  | "startup_sound"
  | "recycle_bin"
  | "defrag"
  | "wifi_bars"
  | "boomer_forward";

export interface Wallpaper {
  id: WallpaperId;
  name: string;
  emoji: string;
  description: string;
  animated: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: Record<string, any>;
  decorationKey?: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "win95_default",
    name: "Win95 Défaut",
    emoji: "🖥️",
    description: "L'authentique sarcelle",
    animated: false,
    style: { background: "#008080" },
    decorationKey: "win95_default",
  },
  {
    id: "bliss",
    name: "Bliss XP",
    emoji: "🌄",
    description: "La vraie colline",
    animated: false,
    style: {
      background: `
        radial-gradient(ellipse at 50% 100%, #4db33b 0%, #5cc43c 35%, #2a7d1a 100%),
        linear-gradient(to bottom, #4fa8e8 0%, #7dc8f8 45%, #a8dcf8 65%, #5cc43c 65%)
      `,
    },
  },
  {
    id: "matrix",
    name: "Je suis The Matrix",
    emoji: "💊",
    description: "Tu as pris la pillule verte",
    animated: true,
    style: { background: "#000500" },
    decorationKey: "matrix",
  },
  {
    id: "space",
    name: "L'espace infini",
    emoji: "🚀",
    description: "Et au-delà™",
    animated: true,
    style: { background: "radial-gradient(ellipse at center, #0d0028 0%, #000010 100%)" },
    decorationKey: "space",
  },
  {
    id: "pizza",
    name: "Pizza Time",
    emoji: "🍕",
    description: "La faim arrive",
    animated: true,
    style: { background: "linear-gradient(135deg, #1a0800 0%, #2d1000 100%)" },
    decorationKey: "pizza",
  },
  {
    id: "cats",
    name: "Chats partout",
    emoji: "🐱",
    description: "On a un problème",
    animated: true,
    style: { background: "#f5e6d3" },
    decorationKey: "cats",
  },
  {
    id: "bsod",
    name: "BSOD Live",
    emoji: "💙",
    description: "C'est un fond d'écran. Promis.",
    animated: false,
    style: { background: "#0000aa" },
    decorationKey: "bsod",
  },
  {
    id: "windows_error",
    name: "Erreur Système",
    emoji: "⛔",
    description: "Ça va très bien",
    animated: true,
    style: { background: "linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%)" },
    decorationKey: "windows_error",
  },
  {
    id: "doge",
    name: "Much Wallpaper",
    emoji: "🐕",
    description: "Very background. Wow.",
    animated: false,
    style: { background: "radial-gradient(circle at 40% 60%, #f5c842 0%, #e8a800 50%, #c47a00 100%)" },
    decorationKey: "doge",
  },
  {
    id: "nyan",
    name: "Nyan Cat Mode",
    emoji: "🌈",
    description: "Nyan nyan nyan nyan nyan",
    animated: true,
    style: { background: "#0a1528" },
    decorationKey: "nyan",
  },
  {
    id: "stonks",
    name: "Stonks Only Go Up",
    emoji: "📈",
    description: "📈📈📈📈",
    animated: true,
    style: { background: "linear-gradient(180deg, #001a00 0%, #003300 100%)" },
    decorationKey: "stonks",
  },
  {
    id: "windows_xp_hill",
    name: "Vraie Bliss HD",
    emoji: "🏔️",
    description: "La colline authentique™",
    animated: false,
    style: {
      background: `linear-gradient(to bottom, #5db8f0 0%, #87ceeb 30%, #b0dcf0 50%, #68b84a 50%, #4a9c2f 65%, #3a8020 100%)`,
    },
    decorationKey: "xphill",
  },
  {
    id: "vaporwave_grid",
    name: "Vaporwave 3000",
    emoji: "🌸",
    description: "A E S T H E T I C",
    animated: true,
    style: { background: "linear-gradient(to bottom, #0d0040 0%, #220055 40%, #440022 70%, #220055 100%)" },
    decorationKey: "vaporwave_grid",
  },
  {
    id: "dark_souls",
    name: "YOU DIED",
    emoji: "⚔️",
    description: "Try desktop again?",
    animated: false,
    style: { background: "#0a0000" },
    decorationKey: "dark_souls",
  },
  {
    id: "loading",
    name: "Chargement...",
    emoji: "⏳",
    description: "Encore un peu...",
    animated: true,
    style: { background: "#1a1a1a" },
    decorationKey: "loading",
  },
  {
    id: "clippy",
    name: "Clippy vous aide",
    emoji: "📎",
    description: "Il a l'air que vous faites un fond d'écran",
    animated: true,
    style: { background: "linear-gradient(135deg, #c8d8f8 0%, #a0c0f0 100%)" },
    decorationKey: "clippy",
  },
  {
    id: "404",
    name: "Fond d'Écran 404",
    emoji: "🔍",
    description: "Fond non trouvé",
    animated: false,
    style: { background: "#f8f8f0" },
    decorationKey: "404",
  },
  {
    id: "dial_up",
    name: "Connexion...",
    emoji: "📞",
    description: "Veuillez patienter...",
    animated: true,
    style: { background: "linear-gradient(135deg, #e8e0d0 0%, #d0c8b8 100%)" },
    decorationKey: "dial_up",
  },
  {
    id: "among_us",
    name: "Sus",
    emoji: "🔴",
    description: "Red is sus",
    animated: true,
    style: { background: "radial-gradient(ellipse at center, #0a1520 0%, #050a0f 100%)" },
    decorationKey: "among_us",
  },
  {
    id: "todo_list",
    name: "TODO List",
    emoji: "📝",
    description: "Des tâches pour demain",
    animated: false,
    style: { background: "#fffde7" },
    decorationKey: "todo_list",
  },
  {
    id: "this_is_fine",
    name: "Tout va bien",
    emoji: "🔥",
    description: "☕ This is fine.",
    animated: true,
    style: { background: "linear-gradient(180deg, #1a0800 0%, #4a1500 40%, #8a2e00 100%)" },
    decorationKey: "this_is_fine",
  },
  {
    id: "rickroll",
    name: "Never Gonna...",
    emoji: "🎵",
    description: "Tu sais ce que c'est",
    animated: true,
    style: { background: "linear-gradient(135deg, #1a001a 0%, #2d0030 100%)" },
    decorationKey: "rickroll",
  },
  {
    id: "aquarium",
    name: "Aquarium 3000",
    emoji: "🐠",
    description: "Le fond d'écran des années 2000",
    animated: true,
    style: { background: "linear-gradient(to bottom, #003366 0%, #0055aa 40%, #0077cc 100%)" },
    decorationKey: "aquarium",
  },
  {
    id: "lemmings",
    name: "Lemmings",
    emoji: "🐹",
    description: "Ils marchent vers leur destin",
    animated: true,
    style: { background: "linear-gradient(to bottom, #87ceeb 0%, #87ceeb 60%, #5a8a3a 60%, #3a6020 100%)" },
    decorationKey: "lemmings",
  },
  {
    id: "coffee",
    name: "Pause café",
    emoji: "☕",
    description: "Brb dans 5 ans",
    animated: true,
    style: { background: "linear-gradient(135deg, #1a0e00 0%, #2d1800 100%)" },
    decorationKey: "coffee",
  },
  {
    id: "windows_update",
    name: "Mise à jour",
    emoji: "🔄",
    description: "Ne pas éteindre l'ordinateur",
    animated: true,
    style: { background: "#00276b" },
    decorationKey: "windows_update",
  },
  {
    id: "confetti",
    name: "Félicitations!",
    emoji: "🎉",
    description: "Pour aucune raison",
    animated: true,
    style: { background: "linear-gradient(135deg, #0d0020 0%, #1a0030 100%)" },
    decorationKey: "confetti",
  },
  {
    id: "printer",
    name: "Imprimante en colère",
    emoji: "🖨️",
    description: "Paper jam. Toujours.",
    animated: true,
    style: { background: "linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%)" },
    decorationKey: "printer",
  },
  {
    id: "captcha",
    name: "Prouvez que vous êtes humain",
    emoji: "🤖",
    description: "Cliquez sur les feux tricolores",
    animated: true,
    style: { background: "#f5f5f5" },
    decorationKey: "captcha",
  },
  {
    id: "snake",
    name: "Snake Nokia 3310",
    emoji: "🐍",
    description: "Score: 0. Inévitable.",
    animated: true,
    style: { background: "#9bbc0f" },
    decorationKey: "snake",
  },
  {
    id: "tamagotchi",
    name: "Tamagotchi mort",
    emoji: "👾",
    description: "Il avait faim. Encore.",
    animated: true,
    style: { background: "linear-gradient(135deg, #ffe0f0 0%, #ffb0d8 100%)" },
    decorationKey: "tamagotchi",
  },
  {
    id: "horaire_sncf",
    name: "Horaires SNCF",
    emoji: "🚂",
    description: "Tous en retard depuis 1985",
    animated: true,
    style: { background: "#002060" },
    decorationKey: "horaire_sncf",
  },
  {
    id: "startup_sound",
    name: "Son de démarrage",
    emoji: "🔊",
    description: "TA-DA (à 3h du matin)",
    animated: true,
    style: { background: "linear-gradient(180deg, #000080 0%, #0000aa 100%)" },
    decorationKey: "startup_sound",
  },
  {
    id: "recycle_bin",
    name: "Corbeille pleine",
    emoji: "🗑️",
    description: "Depuis 2003",
    animated: false,
    style: { background: "#c0c0c0" },
    decorationKey: "recycle_bin",
  },
  {
    id: "defrag",
    name: "Défragmentation",
    emoji: "💾",
    description: "Temps restant: 14h",
    animated: true,
    style: { background: "#000080" },
    decorationKey: "defrag",
  },
  {
    id: "wifi_bars",
    name: "WiFi 1 barre",
    emoji: "📶",
    description: "Suffisant pour rien",
    animated: true,
    style: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" },
    decorationKey: "wifi_bars",
  },
  {
    id: "boomer_forward",
    name: "FW: FW: FW: RE:",
    emoji: "📧",
    description: "Important: lire jusqu'à la fin!!!",
    animated: true,
    style: { background: "#ece9d8" },
    decorationKey: "boomer_forward",
  },
];

export const DEFAULT_WALLPAPER_ID: WallpaperId = "win95_default";
export const WALLPAPER_MAP = new Map(WALLPAPERS.map((w) => [w.id, w]));
