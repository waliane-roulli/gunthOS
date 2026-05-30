"use client";

import { useState } from "react";
import type { RankingEntry, TierId } from "../constants";
import { GameCard } from "./GameCard";
import { GameRow } from "./GameRow";

interface TierRowProps {
  tier: { id: TierId; label: string; emoji: string; color: string };
  games: RankingEntry[];
  readOnly?: boolean;
  viewLayout: "list" | "grid";
  onDrop: (rankingId: number, toTier: TierId) => void;
  onAddFromCatalog?: (gameId: number, toTier: TierId) => void;
  onAddFromIgdb?: (game: import("../constants").IgdbSearchResult, toTier: TierId) => void;
  onRemove?: (gameId: number) => void;
  onUpdateNote?: (rankingId: number, objectiveNote: number | null, noteText: string | null) => void;
  onMove?: (rankingId: number, toTier: TierId) => void;
}

export function TierRow({ tier, games, readOnly, viewLayout, onDrop, onAddFromCatalog, onAddFromIgdb, onRemove, onUpdateNote, onMove }: TierRowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData("text/plain");
    if (raw.startsWith("igdb:")) {
      try {
        const game = JSON.parse(raw.slice(5));
        onAddFromIgdb?.(game, tier.id);
      } catch { /* ignore malformed drop */ }
    } else if (raw.startsWith("catalog:") || raw.startsWith("new:")) {
      const gameId = parseInt(raw.includes("catalog:") ? raw.slice(8) : raw.slice(4), 10);
      if (!isNaN(gameId)) onAddFromCatalog?.(gameId, tier.id);
    } else {
      const rankingId = parseInt(raw, 10);
      if (!isNaN(rankingId)) {
        const entry = games.find((g) => g.id === rankingId);
        if (entry && entry.tier === tier.id) return; // Same tier, no-op
        onDrop(rankingId, tier.id);
      }
    }
  };

  const sorted = [...games].sort((a, b) => a.sortOrder - b.sortOrder);

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
      }}
    >
      {/* Header — clickable to collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0 w-full text-left"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--t-text)",
          borderBottom: collapsed ? "none" : "1px solid var(--t-border-dark)",
        }}
      >
        <span style={{ fontSize: "var(--t-text-md)", transition: "transform 0.15s", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
          ▼
        </span>
        <span style={{ fontSize: "var(--t-text-lg)" }}>{tier.emoji}</span>
        <span className="font-bold" style={{ fontSize: "var(--t-text-sm)", color: tier.color }}>
          {tier.label}
        </span>
        <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
          · {games.length} jeu{games.length !== 1 ? "x" : ""}
        </span>
      </button>

      {/* Game list */}
      {!collapsed && (
        <div className="flex gap-2 p-2 flex-1 overflow-auto" style={{ flexDirection: viewLayout === "grid" ? "row" : "column", flexWrap: viewLayout === "grid" ? "wrap" : "nowrap" }}>
          {sorted.map((r) =>
            viewLayout === "list" ? (
              <GameRow
                key={r.id}
                ranking={r}
                readOnly={readOnly}
                onRemove={onRemove}
                onUpdateNote={onUpdateNote}
                onMove={onMove}
              />
            ) : (
              <GameCard
                key={r.id}
                ranking={r}
                readOnly={readOnly}
                onRemove={onRemove}
                onUpdateNote={onUpdateNote}
              />
            )
          )}
          {games.length === 0 && (
            <div
              className="flex items-center justify-center w-full flex-1"
              style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)", minHeight: viewLayout === "list" ? 64 : 80 }}
            >
              {readOnly ? "Aucun jeu" : "Glisse un jeu ici"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
