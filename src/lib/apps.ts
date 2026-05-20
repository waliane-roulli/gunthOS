import type { App } from "@/types";
import type { Route } from "next";

export const APPS: App[] = [
  {
    slug: "plouf-plouf",
    name: "Plouf Plouf",
    description: "Tirage au sort façon Web 1.0",
    emoji: "💧",
    href: "/plouf-plouf",
    badge: "NEW!",
  },
  {
    slug: "profile",
    name: "Mon Profil",
    description: "Votre fiche GunthOS™",
    emoji: "👤",
    href: "/profile" as Route,
  },
  {
    slug: "directory",
    name: "Annuaire",
    description: "Tous les utilisateurs GunthOS",
    emoji: "📋",
    href: "/directory" as Route,
  },
];
