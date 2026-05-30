"use client";

import { useState, useCallback } from "react";
import type { RankingEntry, TierId } from "../constants";
import { GameCard } from "./GameCard";
import { GameRow } from "./GameRow";

const NUMBERED_TIERS = new Set<TierId>(["diamond", "gold", "silver", "bronze"]);

interface TierRowProps {
  tier: { id: TierId; label: string; emoji: string; color: string };
  games: RankingEntry[];
  readOnly?: boolean;
  viewLayout: "list" | "grid";
  recentlyMovedIds?: Set<number>;
  onDrop: (rankingId: number, toTier: TierId, toIndex?: number) => void;
  onAddFromCatalog?: (gameId: number, toTier: TierId, toIndex?: number) => void;
  onAddFromIgdb?: (game: import("../constants").IgdbSearchResult, toTier: TierId, toIndex?: number) => void;
  onRemove?: (gameId: number) => void;
  onUpdateNote?: (rankingId: number, objectiveNote: number | null, noteText: string | null, playedOn?: string | null) => void;
  onMove?: (rankingId: number, toTier: TierId) => void;
  onReorder?: (rankingId: number, toIndex: number) => void;
  onDetailClick?: (ranking: RankingEntry) => void;
  globalRankOffset?: number;
}

export function TierRow({ tier, games, readOnly, viewLayout, recentlyMovedIds, onDrop, onAddFromCatalog, onAddFromIgdb, onRemove, onUpdateNote, onMove, onReorder, onDetailClick, globalRankOffset }: TierRowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<{ idx: number; before: boolean } | null>(null);

  const showRankNumbers = NUMBERED_TIERS.has(tier.id);

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
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
        onAddFromIgdb?.(game, tier.id, games.length);
      } catch { /* ignore malformed drop */ }
    } else if (raw.startsWith("catalog:") || raw.startsWith("new:")) {
      const gameId = parseInt(raw.includes("catalog:") ? raw.slice(8) : raw.slice(4), 10);
      if (!isNaN(gameId)) onAddFromCatalog?.(gameId, tier.id, games.length);
    } else {
      const rankingId = parseInt(raw, 10);
      if (!isNaN(rankingId)) {
        const entry = games.find((g) => g.id === rankingId);
        if (entry && entry.tier === tier.id) return;
        onDrop(rankingId, tier.id);
      }
    }
  };

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const before = e.clientY < midY;
    setDropIndex({ idx: index, before });
  }, [readOnly]);

  const handleItemDrop = useCallback((e: React.DragEvent, index: number) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setDropIndex(null);
    const raw = e.dataTransfer.getData("text/plain");
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const before = e.clientY < midY;
    const toIndex = before ? index : index + 1;

    // Catalog / IGDB drops at a specific position
    if (raw.startsWith("igdb:")) {
      try {
        const game = JSON.parse(raw.slice(5));
        onAddFromIgdb?.(game, tier.id, toIndex);
      } catch { /* ignore malformed drop */ }
      return;
    }
    if (raw.startsWith("catalog:") || raw.startsWith("new:")) {
      const gameId = parseInt(raw.includes("catalog:") ? raw.slice(8) : raw.slice(4), 10);
      if (!isNaN(gameId)) onAddFromCatalog?.(gameId, tier.id, toIndex);
      return;
    }

    // Existing ranking reorder
    const rankingId = parseInt(raw, 10);
    if (isNaN(rankingId)) return;
    const entry = games.find((g) => g.id === rankingId);
    if (!entry) return;
    if (entry.tier !== tier.id) {
      onDrop(rankingId, tier.id, toIndex);
      return;
    }
    if (!onReorder) return;
    onReorder(rankingId, toIndex);
  }, [readOnly, games, tier.id, onDrop, onReorder, onAddFromCatalog, onAddFromIgdb]);

  const handleItemDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setDropIndex(null);
    }
  }, []);

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
        viewLayout === "grid" ? (
          <div className="flex gap-2 p-2 flex-1 overflow-auto flex-wrap">
            {sorted.map((r, index) => {
              const isDropBefore = dropIndex?.idx === index && dropIndex?.before;
              const isDropAfter = dropIndex?.idx === index && !dropIndex?.before;
              return (
                <div
                  key={r.id}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, index)}
                  style={{
                    borderTop: isDropBefore ? "2px solid var(--t-accent)" : "2px solid transparent",
                    borderBottom: isDropAfter ? "2px solid var(--t-accent)" : "2px solid transparent",
                  }}
                >
                  <GameCard
                    ranking={r}
                    readOnly={readOnly}
                    isNew={recentlyMovedIds?.has(r.id)}
                    onRemove={onRemove}
                    onUpdateNote={onUpdateNote}
                    onDetailClick={onDetailClick}
                  />
                </div>
              );
            })}
            {games.length === 0 && (
              <div
                className="flex items-center justify-center w-full flex-1"
                style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)", minHeight: 80 }}
              >
                {readOnly ? "Aucun jeu" : "Glisse un jeu ici"}
              </div>
            )}
          </div>
        ) : (
          <div
            className="gap-2 p-2 flex-1 overflow-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              alignContent: "start",
            }}
          >
            {sorted.map((r, index) => {
              const rankNum = showRankNumbers ? (globalRankOffset ?? 0) + index + 1 : null;
              const isDropBefore = dropIndex?.idx === index && dropIndex?.before;
              const isDropAfter = dropIndex?.idx === index && !dropIndex?.before;
              return (
                <div
                  key={r.id}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, index)}
                  style={{
                    borderTop: isDropBefore ? "2px solid var(--t-accent)" : "2px solid transparent",
                    borderBottom: isDropAfter ? "2px solid var(--t-accent)" : "2px solid transparent",
                  }}
                >
                  <GameRow
                    ranking={r}
                    readOnly={readOnly}
                    isNew={recentlyMovedIds?.has(r.id)}
                    onRemove={onRemove}
                    onUpdateNote={onUpdateNote}
                    onMove={onMove}
                    onDetailClick={onDetailClick}
                    rankNumber={rankNum}
                  />
                </div>
              );
            })}
            {games.length === 0 && (
              <div
                className="flex items-center justify-center"
                style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)", minHeight: 64 }}
              >
                {readOnly ? "Aucun jeu" : "Glisse un jeu ici"}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
