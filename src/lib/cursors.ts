// Curseurs personnalisés GunthOS — encodés en SVG base64
// Point d'ancrage : hotspot X,Y dans le SVG (là où le clic est détecté)

export interface CursorDef {
  id: string;
  label: string;
  emoji: string;
  description: string;
  // valeur CSS cursor: url(...) X Y, fallback
  css: string;
}

function svgToCursor(svg: string, hotX = 0, hotY = 0): string {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `url("data:image/svg+xml;base64,${encoded}") ${hotX} ${hotY}, default`;
}

// ── Curseurs ────────────────────────────────────────────────────────────────

const ARROW_WIN95 = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <polygon points="4,2 4,24 9,19 13,28 16,27 12,18 19,18" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`, 4, 2);

const HAND_GLOVE = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <g fill="white" stroke="black" stroke-width="1.2">
    <!-- index tendu -->
    <rect x="13" y="4" width="5" height="12" rx="2.5"/>
    <!-- autres doigts pliés -->
    <rect x="8" y="9" width="5" height="10" rx="2.5"/>
    <rect x="18" y="10" width="5" height="9" rx="2.5"/>
    <rect x="23" y="12" width="4" height="7" rx="2"/>
    <!-- paume -->
    <rect x="7" y="16" width="19" height="9" rx="3"/>
    <!-- pouce -->
    <rect x="3" y="17" width="5" height="7" rx="2.5"/>
  </g>
</svg>`, 13, 4);

const HOURGLASS = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <g fill="white" stroke="black" stroke-width="1.5">
    <polygon points="8,4 24,4 16,16 8,4" fill="#c0c0c0"/>
    <polygon points="8,28 24,28 16,16 8,28" fill="#000080"/>
    <rect x="7" y="3" width="18" height="3" rx="1" fill="black"/>
    <rect x="7" y="26" width="18" height="3" rx="1" fill="black"/>
    <!-- sable qui coule -->
    <line x1="16" y1="16" x2="16" y2="22" stroke="#c0c0c0" stroke-width="2"/>
    <circle cx="16" cy="24" r="2" fill="#c0c0c0" stroke="none"/>
  </g>
</svg>`, 16, 16);

const CROSSHAIR_GUNTH = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <circle cx="16" cy="16" r="10" fill="none" stroke="#ff0000" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="2" fill="#ff0000"/>
  <line x1="16" y1="2" x2="16" y2="10" stroke="#ff0000" stroke-width="1.5"/>
  <line x1="16" y1="22" x2="16" y2="30" stroke="#ff0000" stroke-width="1.5"/>
  <line x1="2" y1="16" x2="10" y2="16" stroke="#ff0000" stroke-width="1.5"/>
  <line x1="22" y1="16" x2="30" y2="16" stroke="#ff0000" stroke-width="1.5"/>
  <text x="16" y="9" text-anchor="middle" font-family="monospace" font-size="5" fill="#ff0000">PID666</text>
</svg>`, 16, 16);

const FLOPPY_CURSOR = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <g>
    <!-- corps disquette -->
    <rect x="6" y="4" width="18" height="20" rx="2" fill="black" stroke="black"/>
    <rect x="7" y="5" width="16" height="18" rx="1" fill="#1a1a1a"/>
    <!-- fenêtre métal -->
    <rect x="9" y="13" width="12" height="8" rx="1" fill="#c0c0c0"/>
    <rect x="13" y="13" width="2" height="8" fill="#808080"/>
    <!-- étiquette -->
    <rect x="10" y="6" width="10" height="6" rx="1" fill="white"/>
    <line x1="11" y1="8" x2="19" y2="8" stroke="#000080" stroke-width="0.8"/>
    <line x1="11" y1="10" x2="17" y2="10" stroke="#000080" stroke-width="0.8"/>
    <!-- trou protection -->
    <rect x="17" y="6" width="2" height="2" fill="#404040" rx="0.5"/>
    <!-- flèche en bas à droite -->
    <polygon points="18,22 26,22 26,30 18,30" fill="none"/>
    <polygon points="21,24 25,24 25,28 21,28" fill="white" stroke="black" stroke-width="1"/>
    <line x1="22" y1="25" x2="24" y2="27" stroke="black" stroke-width="1.2"/>
    <line x1="24" y1="25" x2="22" y2="27" stroke="black" stroke-width="1.2"/>
  </g>
</svg>`, 6, 4);

const CLIPPY_CURSOR = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <!-- trombone corps -->
  <path d="M16 3 C11 3 8 6 8 10 C8 14 10 16 10 20 C10 24 12 26 16 26 C20 26 22 24 22 20 L22 12 C22 8 20 6 17 6 C14 6 13 8 13 10 L13 20 C13 22 14 23 16 23 C18 23 19 22 19 20 L19 12"
        fill="none" stroke="#c0c0c0" stroke-width="2.5" stroke-linecap="round"/>
  <!-- yeux expressifs -->
  <circle cx="14" cy="10" r="1.5" fill="black"/>
  <circle cx="18" cy="10" r="1.5" fill="black"/>
  <circle cx="14.5" cy="9.5" r="0.5" fill="white"/>
  <circle cx="18.5" cy="9.5" r="0.5" fill="white"/>
  <!-- sourcils suspicieux -->
  <line x1="12.5" y1="8" x2="15.5" y2="8.5" stroke="black" stroke-width="0.8"/>
  <line x1="17" y1="8.5" x2="20" y2="8" stroke="black" stroke-width="0.8"/>
  <!-- bouche -->
  <path d="M14 12 Q16 13.5 18 12" fill="none" stroke="black" stroke-width="0.8"/>
</svg>`, 16, 3);

const PLOUF_CURSOR = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <!-- goutte d'eau -->
  <path d="M16 4 C16 4 8 14 8 20 C8 25 11.5 28 16 28 C20.5 28 24 25 24 20 C24 14 16 4 16 4Z"
        fill="#4fc3f7" stroke="#0288d1" stroke-width="1.2"/>
  <!-- reflet -->
  <ellipse cx="13" cy="18" rx="2" ry="4" fill="rgba(255,255,255,0.4)" transform="rotate(-15 13 18)"/>
  <!-- texte PLOUF -->
  <text x="16" y="22" text-anchor="middle" font-family="monospace" font-size="5.5" font-weight="bold" fill="#01579b">PLOUF</text>
</svg>`, 16, 4);

const POINTER_SKELETON = svgToCursor(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <!-- main squelette vue de face -->
  <!-- paume -->
  <rect x="9" y="16" width="14" height="10" rx="2" fill="none" stroke="white" stroke-width="1.2"/>
  <!-- os paume intérieur -->
  <line x1="13" y1="16" x2="13" y2="26" stroke="white" stroke-width="0.7"/>
  <line x1="17" y1="16" x2="17" y2="26" stroke="white" stroke-width="0.7"/>
  <line x1="21" y1="16" x2="21" y2="26" stroke="white" stroke-width="0.7"/>
  <!-- index tendu -->
  <rect x="13" y="4" width="4" height="13" rx="2" fill="none" stroke="white" stroke-width="1.2"/>
  <line x1="15" y1="4" x2="15" y2="17" stroke="white" stroke-width="0.7"/>
  <line x1="13" y1="9" x2="17" y2="9" stroke="white" stroke-width="0.6"/>
  <line x1="13" y1="13" x2="17" y2="13" stroke="white" stroke-width="0.6"/>
  <!-- autres doigts pliés -->
  <rect x="9" y="9" width="4" height="8" rx="2" fill="none" stroke="white" stroke-width="1.2"/>
  <line x1="11" y1="9" x2="11" y2="17" stroke="white" stroke-width="0.6"/>
  <rect x="17" y="10" width="4" height="7" rx="2" fill="none" stroke="white" stroke-width="1.2"/>
  <rect x="21" y="12" width="3" height="5" rx="1.5" fill="none" stroke="white" stroke-width="1.2"/>
  <!-- pouce -->
  <rect x="5" y="17" width="5" height="6" rx="2" fill="none" stroke="white" stroke-width="1.2"/>
</svg>`, 15, 4);

// ── Liste exportée ──────────────────────────────────────────────────────────

export const CURSORS: CursorDef[] = [
  {
    id: "default",
    label: "NORMAL",
    emoji: "🖱️",
    description: "Curseur système par défaut",
    css: "default",
  },
  {
    id: "win95",
    label: "WIN95",
    emoji: "🪟",
    description: "La flèche classique Windows 95",
    css: ARROW_WIN95,
  },
  {
    id: "glove",
    label: "GANT BLANC",
    emoji: "🤍",
    description: "La main avec gant de Mickey",
    css: HAND_GLOVE,
  },
  {
    id: "hourglass",
    label: "SABLIER",
    emoji: "⏳",
    description: "Chargement... infini",
    css: HOURGLASS,
  },
  {
    id: "crosshair",
    label: "PID 666",
    emoji: "🎯",
    description: "Le processus mystérieux vous cible",
    css: CROSSHAIR_GUNTH,
  },
  {
    id: "floppy",
    label: "DISQUETTE",
    emoji: "💾",
    description: "Sauvegardez avant de cliquer",
    css: FLOPPY_CURSOR,
  },
  {
    id: "clippy",
    label: "CLIPPY",
    emoji: "📎",
    description: "Il a l'air de vouloir vous aider",
    css: CLIPPY_CURSOR,
  },
  {
    id: "plouf",
    label: "PLOUF",
    emoji: "💧",
    description: "Une goutte qui fait PLOUF",
    css: PLOUF_CURSOR,
  },
  {
    id: "skeleton",
    label: "SQUELETTE",
    emoji: "💀",
    description: "Pour les utilisateurs avancés",
    css: POINTER_SKELETON,
  },
];

export type CursorId = (typeof CURSORS)[number]["id"];

export const DEFAULT_CURSOR_ID: CursorId = "default";
export const CURSOR_MAP = new Map(CURSORS.map((c) => [c.id, c]));
