import type { IconTheme } from "../types";
import { lucideTheme } from "./lucide";

export const pastelTheme: IconTheme = {
  ...lucideTheme,
  id: "pastel",
  displayName: "Pastel",
  description: "Tons doux et colorés, style kawaii",
  preview: "🌸",
  style: "pastel",
  icons: {
    ...lucideTheme.icons,
    peagle:           { ...lucideTheme.icons["peagle"]!,          bgColor: "#ffd6d6" },
    "plouf-plouf":    { ...lucideTheme.icons["plouf-plouf"]!,     bgColor: "#cce5ff" },
    profile:          { ...lucideTheme.icons["profile"]!,         bgColor: "#ead6ff" },
    directory:        { ...lucideTheme.icons["directory"]!,       bgColor: "#ccf0dc" },
    msn:              { ...lucideTheme.icons["msn"]!,             bgColor: "#cce4ff" },
    radio:            { ...lucideTheme.icons["radio"]!,           bgColor: "#ffe8cc" },
    "linked-gunth":   { ...lucideTheme.icons["linked-gunth"]!,    bgColor: "#cce4f7" },
    "gunther-board":  { ...lucideTheme.icons["gunther-board"]!,   bgColor: "#cce2f0" },
    admin:            { ...lucideTheme.icons["admin"]!,           bgColor: "#d4dde3" },
    "my-computer":    { ...lucideTheme.icons["my-computer"]!,     bgColor: "#c9efec" },
    trash:            { ...lucideTheme.icons["trash"]!,           bgColor: "#dde8e8" },
    settings:         { ...lucideTheme.icons["settings"]!,        bgColor: "#d1dde2" },
    login:            { ...lucideTheme.icons["login"]!,           bgColor: "#c8e6c9" },
    "public-profile": { ...lucideTheme.icons["public-profile"]!,  bgColor: "#e1c6f5" },
    solitaire:        { ...lucideTheme.icons["solitaire"]!,       bgColor: "#c8e6c9" },
    defrag:           { ...lucideTheme.icons["defrag"]!,          bgColor: "#c9d8f5" },
    notepad:          { ...lucideTheme.icons["notepad"]!,         bgColor: "#d2d9dc" },
    printer:          { ...lucideTheme.icons["printer"]!,         bgColor: "#d9ccc6" },
    ie:               { ...lucideTheme.icons["ie"]!,              bgColor: "#c9d8f5" },
    changelog:        { ...lucideTheme.icons["changelog"]!,       bgColor: "#d9cfc9" },
  },
};
