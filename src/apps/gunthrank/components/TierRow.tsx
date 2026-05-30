"use client";

import { useState } from "react";
import type { RankingEntry, TierId } from "../constants";
import { GameCard } from "./GameCard";

interface TierRowProps {
  tier: { id: TierId; label: string; emoji: string; color: string };
  games: RankingEntry[];
  readOnly?: boolean;
  onDrop: (rankingId: number, toTier: TierId) => void;
  onRemove?: (gameId: number) => void;
  onUpdateNote?: (rankingId: number, objectiveNote: number | null, noteText: string | null) => void;
}

export function TierRow({ tier, games, readOnly, onDrop, onRemove, onUpdateNote }: TierRowProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOver(false);
    const rankingId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(rankingId)) {
      onDrop(rankingId, tier.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="rounded flex flex-col"
      style={{
        background: dragOver ? "var(--t-accent-hover)" : "var(--t-bg-dark)",
        borderTop: "2px solid var(--t-border-light)",
        borderLeft: "2px solid var(--t-border-light)",
        borderBottom: "2px solid var(--t-border-dark)",
        borderRight: "2px solid var(--t-border-dark)",
        transition: "background 0.15s",
        minHeight: 120,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--t-border-dark)" }}
      >
        <span style={{ fontSize: "var(--t-text-lg)" }}>{tier.emoji}</span>
        <span
          className="font-bold"
          style={{ fontSize: "var(--t-text-sm)", color: tier.color }}
        >
          {tier.label}
        </span>
        <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
          ({games.length})
        </span>
      </div>

      {/* Game cards */}
      <div className="flex gap-2 p-2 overflow-x-auto flex-1 items-start flex-wrap">
        {games
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((r) => (
            <GameCard
              key={r.id}
              ranking={r}
              readOnly={readOnly}
              onRemove={onRemove}
              onUpdateNote={onUpdateNote}
            />
          ))}
        {games.length === 0 && (
          <div
            className="flex items-center justify-center w-full flex-1"
            style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)", minHeight: 80 }}
          >
            {readOnly ? "Aucun jeu" : "Glisse un jeu ici"}
          </div>
        )}
      </div>
    </div>
  );
}
