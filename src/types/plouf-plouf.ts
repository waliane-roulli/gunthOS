export type DrawMode = "roulette" | "horizontal" | "vertical";

export type CelebType =
  | "confetti"
  | "hearts"
  | "matrix"
  | "bubbles"
  | "fireworks"
  | "rain"
  | "xp"
  | "money"
  | "stars"
  | "alien"
  | "flame"
  | "poop";

export interface CelebrationOptions {
  preset: string;
  type: CelebType;
  text: string;
  density: number;
  duration: number;
  shake: number;
  color1: string;
  color2: string;
  color3: string;
  rainbow: boolean;
  flash: boolean;
  marquee: boolean;
  bigText: boolean;
  damageNumbers: boolean;
  bgPulse: boolean;
  epicResult: boolean;
  randomPreset: boolean;
}

export const DEFAULT_OPTIONS: CelebrationOptions = {
  preset: "classic",
  type: "confetti",
  text: "VICTOIRE!",
  density: 150,
  duration: 4,
  shake: 5,
  color1: "#ff0080",
  color2: "#00ffff",
  color3: "#ffee00",
  rainbow: true,
  flash: true,
  marquee: true,
  bigText: true,
  damageNumbers: true,
  bgPulse: true,
  epicResult: true,
  randomPreset: false,
};

export type PresetName =
  | "classic"
  | "vampire"
  | "disco"
  | "chaos"
  | "zen"
  | "retro"
  | "kawaii"
  | "glitch"
  | "rave"
  | "sadboi"
  | "tropical"
  | "pixel";

export const PRESETS: Record<PresetName, CelebrationOptions> = {
  classic: { ...DEFAULT_OPTIONS, preset: "classic" },
  vampire: {
    ...DEFAULT_OPTIONS,
    preset: "vampire",
    type: "xp",
    text: "LOOT!",
    density: 300,
    duration: 5,
    shake: 7,
    color1: "#00ff41",
    color2: "#ff00ff",
    color3: "#ffea00",
    rainbow: false,
    marquee: false,
  },
  disco: {
    ...DEFAULT_OPTIONS,
    preset: "disco",
    type: "fireworks",
    text: "DISCO!",
    density: 220,
    duration: 6,
    shake: 3,
    color1: "#ff00ff",
    color2: "#ffea00",
    color3: "#00ffff",
    damageNumbers: false,
    bgPulse: true,
  },
  chaos: {
    ...DEFAULT_OPTIONS,
    preset: "chaos",
    type: "alien",
    text: "INVASION!!",
    density: 350,
    duration: 8,
    shake: 10,
    color1: "#00ff41",
    color2: "#9900ff",
    color3: "#ff0000",
    rainbow: false,
    flash: true,
    marquee: false,
    bgPulse: false,
  },
  zen: {
    ...DEFAULT_OPTIONS,
    preset: "zen",
    type: "bubbles",
    text: "~ calme ~",
    density: 50,
    duration: 4,
    shake: 0,
    color1: "#b8e6ff",
    color2: "#e0f0ff",
    color3: "#ffffff",
    rainbow: false,
    flash: false,
    marquee: false,
    bigText: false,
    damageNumbers: false,
    bgPulse: false,
  },
  retro: {
    ...DEFAULT_OPTIONS,
    preset: "retro",
    type: "hearts",
    text: "♥ WIN! ♥",
    density: 180,
    duration: 5,
    shake: 4,
    color1: "#ff0080",
    color2: "#ff00ff",
    color3: "#ff69b4",
    damageNumbers: false,
  },
  kawaii: {
    ...DEFAULT_OPTIONS,
    preset: "kawaii",
    type: "stars",
    text: "SUGOI!!",
    density: 120,
    duration: 5,
    shake: 2,
    color1: "#ff88c2",
    color2: "#ffc0eb",
    color3: "#fff0f5",
    rainbow: true,
    damageNumbers: false,
    marquee: false,
    bgPulse: true,
  },
  glitch: {
    ...DEFAULT_OPTIONS,
    preset: "glitch",
    type: "matrix",
    text: "H4CK3D!!",
    density: 300,
    duration: 4,
    shake: 8,
    color1: "#00ff41",
    color2: "#00cc33",
    color3: "#003b00",
    rainbow: false,
    flash: true,
    marquee: true,
    bigText: true,
    damageNumbers: true,
    bgPulse: false,
  },
  rave: {
    ...DEFAULT_OPTIONS,
    preset: "rave",
    type: "flame",
    text: "UNTZ UNTZ!!",
    density: 350,
    duration: 6,
    shake: 10,
    color1: "#ff00ff",
    color2: "#ff6600",
    color3: "#ffff00",
    rainbow: false,
    flash: true,
    damageNumbers: true,
    epicResult: true,
  },
  sadboi: {
    ...DEFAULT_OPTIONS,
    preset: "sadboi",
    type: "rain",
    text: "PLEURE...",
    density: 45,
    duration: 7,
    shake: 1,
    color1: "#4169e1",
    color2: "#6495ed",
    color3: "#87ceeb",
    rainbow: false,
    flash: false,
    marquee: false,
    bigText: false,
    damageNumbers: false,
    bgPulse: false,
    epicResult: false,
  },
  tropical: {
    ...DEFAULT_OPTIONS,
    preset: "tropical",
    type: "money",
    text: "ALOHA!",
    density: 150,
    duration: 5,
    shake: 3,
    color1: "#ffd700",
    color2: "#ff6b35",
    color3: "#ff1493",
    rainbow: true,
    flash: true,
    bigText: true,
    damageNumbers: false,
    epicResult: true,
  },
  pixel: {
    ...DEFAULT_OPTIONS,
    preset: "pixel",
    type: "poop",
    text: "GAME OVER!",
    density: 180,
    duration: 5,
    shake: 6,
    color1: "#8b4513",
    color2: "#654321",
    color3: "#d2691e",
    rainbow: false,
    flash: false,
    marquee: true,
    bigText: true,
    damageNumbers: true,
    bgPulse: false,
  },
};
