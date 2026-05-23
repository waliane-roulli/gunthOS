import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const synthwaveTheme: IconTheme = {
  ...lucideTheme,
  id: "synthwave",
  displayName: "Synthwave",
  description: "Rétro-futuriste années 80, dégradés violets et néons",
  preview: "🌆",
  style: "synthwave",
  icons: {
    ...lucideTheme.icons,
    peggle:           { ...lucideTheme.icons["peggle"]!,          color: "#ff2d78" },
    "plouf-plouf":    { ...lucideTheme.icons["plouf-plouf"]!,     color: "#00e5ff" },
    profile:          { ...lucideTheme.icons["profile"]!,         color: "#e040fb" },
    directory:        { ...lucideTheme.icons["directory"]!,       color: "#69ff47" },
    msn:              { ...lucideTheme.icons["msn"]!,             color: "#40c4ff" },
    radio:            { ...lucideTheme.icons["radio"]!,           color: "#ff6e40" },
    "linked-gunth":   { ...lucideTheme.icons["linked-gunth"]!,    color: "#40c4ff" },
    "gunther-board":  { ...lucideTheme.icons["gunther-board"]!,   color: "#7c4dff" },
    admin:            { ...lucideTheme.icons["admin"]!,           color: "#84ffff" },
    "my-computer":    { ...lucideTheme.icons["my-computer"]!,     color: "#64ffda" },
    trash:            { ...lucideTheme.icons["trash"]!,           color: "#b0bec5" },
    settings:         { ...lucideTheme.icons["settings"]!,        color: "#80d8ff" },
    login:            { ...lucideTheme.icons["login"]!,           color: "#ccff90" },
    "public-profile": { ...lucideTheme.icons["public-profile"]!,  color: "#e040fb" },
    solitaire:        { ...lucideTheme.icons["solitaire"]!,       color: "#69ff47" },
    defrag:           { ...lucideTheme.icons["defrag"]!,          color: "#448aff" },
    notepad:          { ...lucideTheme.icons["notepad"]!,         color: "#80cbc4" },
    printer:          { ...lucideTheme.icons["printer"]!,         color: "#ffccbc" },
    ie:               { ...lucideTheme.icons["ie"]!,              color: "#40c4ff" },
    changelog:        { ...lucideTheme.icons["changelog"]!,       color: "#ffcc80" },
  },
};
