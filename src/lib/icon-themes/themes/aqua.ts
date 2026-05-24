import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const aquaTheme: IconTheme = {
  ...lucideTheme,
  id: "aqua",
  displayName: "Aqua",
  description: "Bulles brillantes style macOS Jaguar / Windows XP",
  preview: "🫧",
  style: "aqua",
  icons: {
    ...lucideTheme.icons,
    peagle:           { ...lucideTheme.icons["peagle"]!,          color: "#e53935" },
    "plouf-plouf":    { ...lucideTheme.icons["plouf-plouf"]!,     color: "#1e88e5" },
    profile:          { ...lucideTheme.icons["profile"]!,         color: "#8e24aa" },
    directory:        { ...lucideTheme.icons["directory"]!,       color: "#43a047" },
    msn:              { ...lucideTheme.icons["msn"]!,             color: "#039be5" },
    radio:            { ...lucideTheme.icons["radio"]!,           color: "#fb8c00" },
    "linked-gunth":   { ...lucideTheme.icons["linked-gunth"]!,    color: "#0288d1" },
    "gunther-board":  { ...lucideTheme.icons["gunther-board"]!,   color: "#0277bd" },
    admin:            { ...lucideTheme.icons["admin"]!,           color: "#455a64" },
    "my-computer":    { ...lucideTheme.icons["my-computer"]!,     color: "#00897b" },
    trash:            { ...lucideTheme.icons["trash"]!,           color: "#78909c" },
    settings:         { ...lucideTheme.icons["settings"]!,        color: "#546e7a" },
    login:            { ...lucideTheme.icons["login"]!,           color: "#388e3c" },
    "public-profile": { ...lucideTheme.icons["public-profile"]!,  color: "#7b1fa2" },
    solitaire:        { ...lucideTheme.icons["solitaire"]!,       color: "#2e7d32" },
    defrag:           { ...lucideTheme.icons["defrag"]!,          color: "#1565c0" },
    notepad:          { ...lucideTheme.icons["notepad"]!,         color: "#37474f" },
    printer:          { ...lucideTheme.icons["printer"]!,         color: "#5d4037" },
    ie:               { ...lucideTheme.icons["ie"]!,              color: "#1565c0" },
    changelog:        { ...lucideTheme.icons["changelog"]!,       color: "#6d4c41" },
  },
};
