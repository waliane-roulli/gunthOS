import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const candyTheme: IconTheme = {
  ...lucideTheme,
  id: "candy",
  displayName: "Candy",
  description: "Dégradés radiaux brillants, bonbons acidulés façon iOS 7",
  preview: "🍬",
  style: "candy",
  icons: {
    ...lucideTheme.icons,
    peggle:           { ...lucideTheme.icons["peggle"]!,          color: "#ff3d5a" },
    "plouf-plouf":    { ...lucideTheme.icons["plouf-plouf"]!,     color: "#3da8ff" },
    profile:          { ...lucideTheme.icons["profile"]!,         color: "#c13dff" },
    directory:        { ...lucideTheme.icons["directory"]!,       color: "#3ddf78" },
    msn:              { ...lucideTheme.icons["msn"]!,             color: "#3db0ff" },
    radio:            { ...lucideTheme.icons["radio"]!,           color: "#ff8c3d" },
    "linked-gunth":   { ...lucideTheme.icons["linked-gunth"]!,    color: "#3dbeff" },
    "gunther-board":  { ...lucideTheme.icons["gunther-board"]!,   color: "#4a3dff" },
    admin:            { ...lucideTheme.icons["admin"]!,           color: "#3d9fff" },
    "my-computer":    { ...lucideTheme.icons["my-computer"]!,     color: "#3dffcc" },
    trash:            { ...lucideTheme.icons["trash"]!,           color: "#adbbc5" },
    settings:         { ...lucideTheme.icons["settings"]!,        color: "#7e9bc5" },
    login:            { ...lucideTheme.icons["login"]!,           color: "#3ddf68" },
    "public-profile": { ...lucideTheme.icons["public-profile"]!,  color: "#c13dff" },
    solitaire:        { ...lucideTheme.icons["solitaire"]!,       color: "#3ddf58" },
    defrag:           { ...lucideTheme.icons["defrag"]!,          color: "#3d78ff" },
    notepad:          { ...lucideTheme.icons["notepad"]!,         color: "#8eaabd" },
    printer:          { ...lucideTheme.icons["printer"]!,         color: "#c49a7e" },
    ie:               { ...lucideTheme.icons["ie"]!,              color: "#3d88ff" },
    changelog:        { ...lucideTheme.icons["changelog"]!,       color: "#d4a03d" },
  },
};
