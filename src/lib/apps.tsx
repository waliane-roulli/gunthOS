import type { App } from "@/types";
import type { Route } from "next";
import { MsnLogo } from "@/components/ui/msn-logo";

export const APPS: App[] = [
  {
    slug: "plouf-plouf",
    name: "Plouf Plouf",
    description: "Tirage au sort façon Web 1.0",
    emoji: "💧",
    href: "/plouf-plouf",
    badge: "NEW",
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
  {
    slug: "msn",
    name: "GunthMessenger™",
    description: "Messagerie instantanée style MSN",
    emoji: "🦋",
    iconNode: <MsnLogo size={46} />,
    href: "/msn" as Route,
  },
  {
    slug: "radio",
    name: "GunthRadio™",
    description: "Fréquence Groove — 6 stations, 0 pub",
    emoji: "📻",
    href: "/radio" as Route,
    badge: "NEW",
  },
];
