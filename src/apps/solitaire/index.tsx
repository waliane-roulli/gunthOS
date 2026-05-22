"use client";

import { useState, useMemo } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RED = new Set(["♥", "♦"]);

function makeCard() {
  const s = pickRandom(SUITS)!;
  const v = pickRandom(VALUES)!;
  return { s, v, red: RED.has(s) };
}

const SOLITAIRE_TAUNTS = [
  "GunthOS Solitaire™ — édition non-gagnante.",
  "Score actuel : 0. Score final : 0. L'intervalle n'a aucune importance.",
  "Statistiques : 0 victoires sur ∞ parties. Vous ne changerez pas la tendance.",
  "Vous avez ouvert ce jeu pour 'deux minutes'. C'était il y a 47 minutes.",
  "La dame de carreau vous juge. Elle l'a toujours fait.",
  "Aucun utilisateur n'a jamais terminé cette partie. Nous avons vérifié les logs.",
  "Le roi de pique attend d'être placé. Il attendra encore longtemps.",
  "Vous jouez au Solitaire. En 1998, c'était une excuse valable.",
  "Note : la victoire n'est pas au programme.",
  "Les cartes savent déjà comment ça va finir.",
  "Ce jeu a été conçu pour perdre. Par des gens qui ont perdu.",
  "IA adverse : inexistante. Tu perds quand même.",
  "Feature 'gagner' en développement depuis 2001.",
];

const CARD_SELECTED_MSGS = [
  (card: string) => `Carte sélectionnée : ${card} — Dépose-la quelque part (spoiler : ça marchera pas)`,
  (card: string) => `${card} sélectionnée. Le reste de la partie est une formalité de défaite.`,
  (card: string) => `${card} choisie avec une précision remarquable. Pour rien.`,
  (card: string) => `Tu as pris ${card}. L'algorithme est déjà au courant.`,
];

const CARD_IDLE_MSGS = [
  "Double-cliquez pour déplacer une carte (fonctionnalité en cours de développement depuis 2001)",
  "Cliquez pour sélectionner • double-cliquez pour espérer",
  "Règle principale : il n'y a pas de règle principale ici.",
  "Astuce : les cartes ne bougent pas toutes seules. Essayez quand même.",
];

export function SolitaireApp(_: AppProps) {
  const [cards] = useState(() => Array.from({ length: 7 }, makeCard));
  const [taunt] = useState(() => pickRandom(SOLITAIRE_TAUNTS));
  const [idleMsg] = useState(() => pickRandom(CARD_IDLE_MSGS));
  const [clicked, setClicked] = useState<number | null>(null);

  const statusMsg = useMemo(() => {
    if (clicked === null || clicked === -1) return idleMsg;
    const card = `${cards[clicked]?.v}${cards[clicked]?.s}`;
    return pickRandom(CARD_SELECTED_MSGS)(card);
  }, [clicked, cards, idleMsg]);

  return (
    <div className="p-4 flex flex-col gap-4 select-none" style={{ fontFamily: "var(--t-font-display)" }}>
      <div
        className="text-center text-sm tracking-widest py-1 border"
        style={{ color: "var(--t-text-muted)", borderColor: "var(--t-border-dark)" }}
      >
        {taunt}
      </div>

      <div className="flex gap-3 items-start">
        <div
          className="w-14 h-20 border-[2px] flex items-center justify-center text-xl cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--t-titlebar-from), var(--t-titlebar-to))",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
          onClick={() => setClicked(-1)}
        >
          <span style={{ color: "var(--t-titlebar-text)", fontSize: "1.2rem" }}>🂠</span>
        </div>
        <div
          className="w-14 h-20 border-[2px] flex items-center justify-center"
          style={{
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            color: "var(--t-text-muted)",
            fontSize: "1.5rem",
          }}
        >
          {clicked === -1 ? <span style={{ color: "var(--t-accent)" }}>✕</span> : ""}
        </div>

        <div className="flex gap-2 ml-auto">
          {SUITS.map((s) => (
            <div
              key={s}
              className="w-14 h-20 border-[2px] flex items-center justify-center text-2xl"
              style={{
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
                color: RED.has(s) ? "var(--t-defrag-fragmented, #cc0000)" : "var(--t-app-text)",
                opacity: 0.4,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => setClicked(i)}
            className="w-14 h-20 border-[2px] flex flex-col items-start justify-start p-1 cursor-pointer"
            style={{
              backgroundColor: clicked === i ? "var(--t-card-hover)" : "var(--t-app-bg)",
              borderTopColor: clicked === i ? "var(--t-border-dark)" : "var(--t-border-light)",
              borderLeftColor: clicked === i ? "var(--t-border-dark)" : "var(--t-border-light)",
              borderBottomColor: clicked === i ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderRightColor: clicked === i ? "var(--t-border-light)" : "var(--t-border-dark)",
              color: c.red ? "var(--t-defrag-fragmented, #cc0000)" : "var(--t-app-text)",
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            <span>{c.v}</span>
            <span>{c.s}</span>
          </button>
        ))}
      </div>

      <div className="text-center text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>
        {statusMsg}
      </div>
    </div>
  );
}
