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
  | "boomer_forward"
  | "minitel"
  | "excel"
  | "powerpoint"
  | "minesweeper"
  | "geocities"
  | "ie6"
  | "notepad"
  | "c64"
  | "winamp"
  | "ms_paint"
  | "aol"
  | "tamagotchi_death"
  | "solitaire"
  | "nasa_panic"
  | "printer_rage"
  | "stackoverflow"
  | "captcha_hell"
  | "nokia3310"
  | "fax_2024"
  | "windows_update_forced"
  | "zoom_meeting"
  | "linkedin_cringe"
  | "jira_ticket"
  | "microwave_office"
  | "dark_mode_extreme"
  | "crypto_bro"
  | "gdpr_popup"
  | "teams_mute"
  | "regex_hell"
  | "404_not_found";

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
      background: `linear-gradient(to bottom, #3a8fd4 0%, #5aacec 30%, #8ecef8 58%, #b8dff8 65%, #4aaa18 65%, #245808 100%)`,
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
  {
    id: "minitel",
    name: "3615 GUNTH",
    emoji: "📟",
    description: "Connexion Minitel Rose en cours...",
    animated: true,
    style: { background: "#050005" },
    decorationKey: "minitel",
  },
  {
    id: "excel",
    name: "Tableur de la Mort",
    emoji: "📊",
    description: "Ligne 1048576 atteinte",
    animated: true,
    style: { background: "linear-gradient(135deg, #e8f0e8 0%, #d0e8d8 100%)" },
    decorationKey: "excel",
  },
  {
    id: "powerpoint",
    name: "Slide de l'Enfer",
    emoji: "📽️",
    description: "87 slides. 0 contenu.",
    animated: true,
    style: { background: "linear-gradient(135deg, #1e003a 0%, #100020 100%)" },
    decorationKey: "powerpoint",
  },
  {
    id: "minesweeper",
    name: "Démineur Fatal",
    emoji: "💣",
    description: "BOOM — comme prévu",
    animated: true,
    style: { background: "#c0c0c0" },
    decorationKey: "minesweeper",
  },
  {
    id: "geocities",
    name: "Ma Page Perso!!!",
    emoji: "🌐",
    description: "VisiteurS: 0000047 — NE PAS VOLER MES GIFs",
    animated: true,
    style: { background: "#000000" },
    decorationKey: "geocities",
  },
  {
    id: "ie6",
    name: "Internet Explorer 6",
    emoji: "🌐",
    description: "Chargement... (depuis 2003)",
    animated: true,
    style: { background: "linear-gradient(135deg, #ece9d8 0%, #d4d0c8 100%)" },
    decorationKey: "ie6",
  },
  {
    id: "notepad",
    name: "Fichier Sans Titre",
    emoji: "📝",
    description: "Voulez-vous enregistrer les modifications ?",
    animated: true,
    style: { background: "#f8f8f8" },
    decorationKey: "notepad",
  },
  {
    id: "c64",
    name: "C64 BASIC",
    emoji: "🕹️",
    description: "64K RAM SYSTEM  38911 BASIC BYTES FREE",
    animated: true,
    style: { background: "#4040a0" },
    decorationKey: "c64",
  },
  {
    id: "winamp",
    name: "Winamp Visualizer",
    emoji: "🎵",
    description: "♫ Sandstorm — Darude (3:45)",
    animated: true,
    style: { background: "#000000" },
    decorationKey: "winamp",
  },
  {
    id: "ms_paint",
    name: "Chef-d'Œuvre MS Paint",
    emoji: "🖌️",
    description: "Enregistré en BMP 24bit. 47 Mo.",
    animated: true,
    style: { background: "#d4d0c8" },
    decorationKey: "ms_paint",
  },
  {
    id: "aol",
    name: "AOL Dial-Up",
    emoji: "📧",
    description: "You've Got Mail (depuis 1998)",
    animated: true,
    style: { background: "linear-gradient(135deg, #003087 0%, #0050c8 100%)" },
    decorationKey: "aol",
  },
  {
    id: "tamagotchi_death",
    name: "Tamagotchi RIP",
    emoji: "💀",
    description: "Il avait faim. T'étais en cours.",
    animated: true,
    style: { background: "linear-gradient(135deg, #ffe0f0 0%, #ffb0d8 100%)" },
    decorationKey: "tamagotchi_death",
  },
  {
    id: "solitaire",
    name: "Solitaire Victoire",
    emoji: "🃏",
    description: "Les cartes tombent. Enfin.",
    animated: true,
    style: { background: "#35763a" },
    decorationKey: "solitaire",
  },
  {
    id: "nasa_panic",
    name: "Houston on a un problème",
    emoji: "🚀",
    description: "T-minus: trop tard",
    animated: true,
    style: { background: "linear-gradient(180deg, #000000 0%, #0a0a1a 100%)" },
    decorationKey: "nasa_panic",
  },
  {
    id: "printer_rage",
    name: "Imprimante Enragée",
    emoji: "🖨️",
    description: "ERROR_PAPER_JAM_FOREVER",
    animated: true,
    style: { background: "linear-gradient(135deg, #e8e8e8 0%, #c8c8c8 100%)" },
    decorationKey: "printer_rage",
  },
  {
    id: "stackoverflow",
    name: "StackOverflow 3h du mat",
    emoji: "💻",
    description: "Copié depuis 2008. Fonctionne pas.",
    animated: true,
    style: { background: "#1a1a1a" },
    decorationKey: "stackoverflow",
  },
  {
    id: "captcha_hell",
    name: "Captcha de l'Enfer",
    emoji: "🤖",
    description: "Sélectionnez tous les feux tricolores",
    animated: true,
    style: { background: "#f5f5f5" },
    decorationKey: "captcha_hell",
  },
  {
    id: "nokia3310",
    name: "Nokia 3310",
    emoji: "📱",
    description: "Batterie: 100%. Indestructible.",
    animated: true,
    style: { background: "#4a5e28" },
    decorationKey: "nokia3310",
  },
  {
    id: "fax_2024",
    name: "Fax Machine 2024",
    emoji: "📠",
    description: "Confirmation de réception... en cours",
    animated: true,
    style: { background: "linear-gradient(135deg, #e8e0d0 0%, #d4ccbc 100%)" },
    decorationKey: "fax_2024",
  },
  {
    id: "windows_update_forced",
    name: "Redémarrage Imminent",
    emoji: "🔄",
    description: "Ne pas éteindre. Trop tard.",
    animated: true,
    style: { background: "#0078d4" },
    decorationKey: "windows_update_forced",
  },
  {
    id: "zoom_meeting",
    name: "Fond Zoom Virtuel",
    emoji: "📹",
    description: "Bureau en ordre. Vie réelle: chaos.",
    animated: true,
    style: { background: "linear-gradient(135deg, #1c1c1c 0%, #2a2a2a 100%)" },
    decorationKey: "zoom_meeting",
  },
  {
    id: "linkedin_cringe",
    name: "Post LinkedIn",
    emoji: "💼",
    description: "Humbled. Grateful. Blessed. 47k impressions.",
    animated: true,
    style: { background: "linear-gradient(135deg, #f3f6f8 0%, #dce6ed 100%)" },
    decorationKey: "linkedin_cringe",
  },
  {
    id: "jira_ticket",
    name: "Sprint Planning",
    emoji: "🎫",
    description: "JIRA-4269: Définir les critères d'acceptance",
    animated: true,
    style: { background: "linear-gradient(135deg, #0052cc 0%, #003e99 100%)" },
    decorationKey: "jira_ticket",
  },
  {
    id: "microwave_office",
    name: "Pause Déjeuner",
    emoji: "🐟",
    description: "L'odeur du poisson au micro-ondes. Impardonnable.",
    animated: true,
    style: { background: "linear-gradient(135deg, #e8e0c8 0%, #ccc0a0 100%)" },
    decorationKey: "microwave_office",
  },
  {
    id: "dark_mode_extreme",
    name: "Abysse Total",
    emoji: "🕳️",
    description: "#000000. Pour toujours.",
    animated: false,
    style: { background: "#000000" },
    decorationKey: "dark_mode_extreme",
  },
  {
    id: "crypto_bro",
    name: "To The Moon 🚀",
    emoji: "🪙",
    description: "GM. Wen lambo. Not financial advice.",
    animated: true,
    style: { background: "linear-gradient(180deg, #000000 0%, #0a0a00 100%)" },
    decorationKey: "crypto_bro",
  },
  {
    id: "gdpr_popup",
    name: "Bannière Cookies",
    emoji: "🍪",
    description: "Veuillez accepter nos 2847 partenaires de confiance.",
    animated: true,
    style: { background: "#ffffff" },
    decorationKey: "gdpr_popup",
  },
  {
    id: "teams_mute",
    name: "Micro Coupé",
    emoji: "🔇",
    description: "Vous parliez. En sourdine. Depuis le début.",
    animated: true,
    style: { background: "linear-gradient(135deg, #201f3c 0%, #141328 100%)" },
    decorationKey: "teams_mute",
  },
  {
    id: "regex_hell",
    name: "Expression Régulière",
    emoji: "⚡",
    description: "(?:[a-z0-9!#$%&'*+/=?^_{|}~-]+) — copié de StackOverflow",
    animated: true,
    style: { background: "linear-gradient(135deg, #0d001a 0%, #060010 100%)" },
    decorationKey: "regex_hell",
  },
  {
    id: "404_not_found",
    name: "Page Introuvable",
    emoji: "🔍",
    description: "Ce fond d'écran n'existe pas. Comme vos données.",
    animated: false,
    style: { background: "#fafafa" },
    decorationKey: "404_not_found",
  },
];

export const DEFAULT_WALLPAPER_ID: WallpaperId = "win95_default";
export const WALLPAPER_MAP = new Map(WALLPAPERS.map((w) => [w.id, w]));
