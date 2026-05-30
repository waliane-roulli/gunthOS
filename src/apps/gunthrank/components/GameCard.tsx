"use client";

import { useState } from "react";
import type { RankingEntry, TierId } from "../constants";

interface GameCardProps {
  ranking: RankingEntry;
  readOnly?: boolean;
  onRemove?: (gameId: number) => void;
  onUpdateNote?: (rankingId: number, objectiveNote: number | null, noteText: string | null) => void;
}

export function GameCard({ ranking, readOnly, onRemove, onUpdateNote }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [noteValue, setNoteValue] = useState(ranking.objectiveNote ?? 5);
  const [noteText, setNoteText] = useState(ranking.noteText ?? "");

  const coverUrl = ranking.game?.coverUrl;

  const handleDragStart = (e: React.DragEvent) => {
    if (readOnly) return;
    e.dataTransfer.setData("text/plain", String(ranking.id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSaveNote = () => {
    onUpdateNote?.(ranking.id, noteValue, noteText || null);
    setExpanded(false);
  };

  return (
    <div
      draggable={!readOnly}
      onDragStart={handleDragStart}
      onClick={() => !readOnly && setExpanded(!expanded)}
      className="flex-shrink-0 rounded cursor-grab active:cursor-grabbing select-none"
      style={{
        width: 100,
        background: "var(--t-card-bg)",
        borderTop: "2px solid var(--t-border-light)",
        borderLeft: "2px solid var(--t-border-light)",
        borderBottom: "2px solid var(--t-border-dark)",
        borderRight: "2px solid var(--t-border-dark)",
      }}
    >
      {/* Cover */}
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{ height: 100, background: "var(--t-bg-dark)" }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={ranking.game?.name ?? ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-muted" style={{ fontSize: "var(--t-text-2xl)" }}>🎮</span>
        )}
      </div>

      {/* Name */}
      <div
        className="px-1 py-0.5 text-center truncate"
        style={{ fontSize: "var(--t-text-xs)" }}
        title={ranking.game?.name ?? "Inconnu"}
      >
        {ranking.game?.name ?? "Inconnu"}
      </div>

      {/* Expanded: note inputs */}
      {expanded && !readOnly && (
        <div
          className="p-2 border-t"
          style={{ borderColor: "var(--t-border-dark)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            Note objective : {noteValue}/10
          </label>
          <input
            type="range"
            min={0} max={10} step={1}
            value={noteValue}
            onChange={(e) => setNoteValue(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Note perso..."
            className="w-full mt-1 p-1"
            style={{
              fontSize: "var(--t-text-xs)",
              background: "var(--t-bg)",
              color: "var(--t-text)",
              borderTop: "2px solid var(--t-border-dark)",
              borderLeft: "2px solid var(--t-border-dark)",
              borderBottom: "2px solid var(--t-border-light)",
              borderRight: "2px solid var(--t-border-light)",
              resize: "none",
              height: 40,
            }}
            rows={2}
          />
          <div className="flex justify-between mt-1">
            <button
              onClick={handleSaveNote}
              className="px-2 py-0.5"
              style={{
                fontSize: "var(--t-text-xs)",
                background: "var(--t-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              OK
            </button>
            <button
              onClick={() => onRemove?.(ranking.gameId)}
              className="px-2 py-0.5"
              style={{
                fontSize: "var(--t-text-xs)",
                background: "var(--t-error)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Retirer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
