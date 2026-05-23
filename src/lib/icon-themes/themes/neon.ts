import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const neonTheme: IconTheme = {
  ...lucideTheme,
  id: "neon",
  displayName: "Néon",
  description: "Fond noir, lueur colorée cyberpunk",
  preview: "💡",
  style: "neon",
  icons: {
    ...lucideTheme.icons,
    peggle:          { ...lucideTheme.icons.peggle!,          color: "#ff2244" },
    "plouf-plouf":   { ...lucideTheme.icons["plouf-plouf"]!,  color: "#22aaff" },
    profile:         { ...lucideTheme.icons.profile!,         color: "#cc44ff" },
    directory:       { ...lucideTheme.icons.directory!,       color: "#00ff88" },
    msn:             { ...lucideTheme.icons.msn!,             color: "#00ccff" },
    radio:           { ...lucideTheme.icons.radio!,           color: "#ff8800" },
    "linked-gunth":  { ...lucideTheme.icons["linked-gunth"]!, color: "#0099ff" },
    "gunther-board": { ...lucideTheme.icons["gunther-board"]!,color: "#00bbff" },
    admin:           { ...lucideTheme.icons.admin!,           color: "#88ffee" },
    "my-computer":   { ...lucideTheme.icons["my-computer"]!,  color: "#00ffcc" },
    trash:           { ...lucideTheme.icons.trash!,           color: "#aaaacc" },
    settings:        { ...lucideTheme.icons.settings!,        color: "#8899bb" },
    login:           { ...lucideTheme.icons.login!,           color: "#00ff66" },
    "public-profile":{ ...lucideTheme.icons["public-profile"]!,color: "#cc44ff" },
    solitaire:       { ...lucideTheme.icons.solitaire!,       color: "#00ff44" },
    defrag:          { ...lucideTheme.icons.defrag!,          color: "#4488ff" },
    notepad:         { ...lucideTheme.icons.notepad!,         color: "#88aadd" },
    printer:         { ...lucideTheme.icons.printer!,         color: "#aabbcc" },
    ie:              { ...lucideTheme.icons.ie!,              color: "#44aaff" },
    changelog:       { ...lucideTheme.icons.changelog!,       color: "#ffbb66" },
  },
};
