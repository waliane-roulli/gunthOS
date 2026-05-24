"use client";

import type { RelicId } from "../engine/roguelite";
import { RELICS } from "../engine/roguelite";
import { PegIcon } from "./PegIcon";

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
          title="Œuf Fantôme actif — si elle tombe, l'aigle le rattrape dans son bec. Il est pas content."
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
            animation: "pulse 1s infinite",
          }}
        >
          <PegIcon id="spooky" size={14} />
        </div>
      )}
      {magnetFrames > 0 && (
        <div
          title={`Serres Aimantées actives — ${Math.ceil(magnetFrames / 60)}s avant que l'aigle recrache l'aimant`}
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
          }}
        >
          <PegIcon id="magnet" size={14} />
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
              cursor: "help",
              flexShrink: 0,
            }}
          >
            <PegIcon id={rid} size={14} />
          </div>
        );
      })}
    </div>
  );
}
