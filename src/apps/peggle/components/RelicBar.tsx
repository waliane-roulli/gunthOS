"use client";

import type { RelicId } from "../engine/roguelite";
import { RELICS } from "../engine/roguelite";

interface RelicBarProps {
  relics: RelicId[];
  spookyActive: boolean;
  magnetFrames: number;
}

export function RelicBar({ relics, spookyActive, magnetFrames }: RelicBarProps) {
  if (relics.length === 0 && !spookyActive && magnetFrames <= 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "0 6px",
        flexShrink: 0,
        overflowX: "auto",
        maxWidth: 220,
      }}
    >
      {/* Active temporary effects */}
      {spookyActive && (
        <div
          title="Spooky Ball actif — la balle reviendra si elle tombe"
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#cc88ff33",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#cc88ff",
            fontSize: 11,
            animation: "pulse 1s infinite",
          }}
        >
          👻
        </div>
      )}
      {magnetFrames > 0 && (
        <div
          title={`Aimant actif — ${Math.ceil(magnetFrames / 60)}s restantes`}
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#4488ff33",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#4488ff",
            fontSize: 11,
          }}
        >
          🧲
        </div>
      )}

      {/* Permanent relics */}
      {relics.map(rid => {
        const r = RELICS[rid];
        if (!r) return null;
        return (
          <div
            key={rid}
            title={`${r.name}: ${r.desc}`}
            style={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: r.color + "22",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: r.color + "66",
              fontSize: 11,
              cursor: "help",
              flexShrink: 0,
            }}
          >
            {r.emoji}
          </div>
        );
      })}
    </div>
  );
}
