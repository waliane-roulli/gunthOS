"use client";

import { useState } from "react";
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
  "Bonne chance. Tu en auras besoin.",
  "GunthOS Solitaire™ — édition non-gagnante.",
  "Rappel : tu peux pas gagner.",
  "Score actuel : 0. Score final : 0.",
  "Statistiques : 0 victoires sur ∞ parties.",
];

export function SolitaireApp(_: AppProps) {
  const [cards] = useState(() => Array.from({ length: 7 }, makeCard));
  const [taunt] = useState(() => pickRandom(SOLITAIRE_TAUNTS));
  const [clicked, setClicked] = useState<number | null>(null);

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
        {clicked !== null && clicked !== -1
          ? `Carte sélectionnée : ${cards[clicked]?.v}${cards[clicked]?.s} — Dépose-la quelque part (spoiler : ça marchera pas)`
          : "Double-cliquez pour déplacer une carte (fonctionnalité en cours de développement depuis 2001)"}
      </div>
    </div>
  );
}
