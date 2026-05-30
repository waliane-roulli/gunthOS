"use client";

import { useState } from "react";
import { useKiffTheme } from "../kiff-theme-context";
import { TIERS, getPlatformColor, type RankingEntry, type TierId } from "../constants";

interface GameRowProps {
  ranking: RankingEntry;
  readOnly?: boolean;
  onRemove?: (gameId: number) => void;
  onUpdateNote?: (rankingId: number, objectiveNote: number | null, noteText: string | null, playedOn?: string | null) => void;
  onMove?: (rankingId: number, toTier: TierId) => void;
  rankNumber?: number | null;
}

export function GameRow({ ranking, readOnly, onRemove, onUpdateNote, onMove, rankNumber }: GameRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [noteValue, setNoteValue] = useState(ranking.objectiveNote ?? 5);
  const [noteText, setNoteText] = useState(ranking.noteText ?? "");
  const [moveTier, setMoveTier] = useState<TierId | null>(null);
  const [playedOn, setPlayedOn] = useState(ranking.playedOn ?? "");
  const { theme } = useKiffTheme();

  const coverUrl = ranking.game?.coverUrl;
  const gameName = ranking.game?.name ?? "Inconnu";
  const hasNote = ranking.objectiveNote != null || (ranking.noteText && ranking.noteText.length > 0);
  const notePreview = ranking.noteText ? ranking.noteText.slice(0, 80) : null;

  let platforms: string[] = [];
  let genres: string[] = [];
  try {
    if (typeof ranking.game?.platforms === "string") platforms = JSON.parse(ranking.game.platforms);
    if (typeof ranking.game?.genres === "string") genres = JSON.parse(ranking.game.genres);
  } catch { /* ignore malformed JSON */ }

  const metaParts: string[] = [];
  if (ranking.playedOn) metaParts.push(ranking.playedOn);
  if (genres.length > 0 && genres[0]) metaParts.push(genres[0]);
  if (ranking.game?.releaseDate) metaParts.push(String(ranking.game.releaseDate));

  const platformColor = getPlatformColor(ranking.playedOn);

  const handleDragStart = (e: React.DragEvent) => {
    if (readOnly) return;
    e.dataTransfer.setData("text/plain", String(ranking.id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSave = () => {
    onUpdateNote?.(ranking.id, noteValue, noteText || null, playedOn || null);
    setExpanded(false);
  };

  const handleCancel = () => {
    setNoteValue(ranking.objectiveNote ?? 5);
    setNoteText(ranking.noteText ?? "");
    setPlayedOn(ranking.playedOn ?? "");
    setMoveTier(null);
    setExpanded(false);
  };

  const handleMove = () => {
    if (moveTier) {
      onMove?.(ranking.id, moveTier);
      setMoveTier(null);
      setExpanded(false);
    }
  };

  const notePct = Math.round(((ranking.objectiveNote ?? 0) / 10) * 100);

  return (
    <div
      draggable={!readOnly}
      onDragStart={handleDragStart}
      className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: "var(--t-card-bg)",
        borderTop: "2px solid var(--t-border-light)",
        borderLeft: "2px solid var(--t-border-light)",
        borderBottom: "2px solid var(--t-border-dark)",
        borderRight: "2px solid var(--t-border-dark)",
      }}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-2 px-2 py-1.5 min-w-0"
        onClick={() => { if (!readOnly) setExpanded(!expanded); }}
      >
        {/* Rank number */}
        {rankNumber != null && (
          <div
            className="flex-shrink-0 flex items-center justify-center font-bold"
            style={{
              width: 18,
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
            }}
          >
            {rankNumber}
          </div>
        )}

        {/* Platform color indicator */}
        {platformColor && theme.rowPlatform !== "none" && (
          <div
            className="flex-shrink-0 rounded"
            style={{
              width: theme.rowPlatform === "left-border" ? 4 : 3,
              height: 64,
              background: platformColor,
            }}
          />
        )}

        {/* Cover */}
        <div className="flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ width: 48, height: 64, background: "var(--t-bg-dark)" }}>
          {coverUrl ? (
            <img src={coverUrl} alt={gameName} className="w-full h-full object-cover" loading="lazy" draggable={false} />
          ) : (
            <span style={{ fontSize: "var(--t-text-lg)" }}>🎮</span>
          )}
        </div>

        {/* Center: name + meta */}
        <div className="min-w-0 flex-1">
          <div className="font-bold truncate" style={{ fontSize: "var(--t-text-sm)", color: "var(--t-text)" }}>
            {gameName}
          </div>
          {metaParts.length > 0 && (
            <div className="truncate" style={{ fontSize: "calc(var(--t-text-xs) * 0.85)", color: "var(--t-text-muted)" }}>
              {metaParts.join(" · ")}
            </div>
          )}
          {notePreview && !expanded && (
            <div className="truncate italic" style={{ fontSize: "calc(var(--t-text-xs) * 0.85)", color: "var(--t-text-muted)" }}>
              &ldquo;{notePreview}{ranking.noteText && ranking.noteText.length > 80 ? "..." : ""}&rdquo;
            </div>
          )}
        </div>

        {/* Right: note */}
        <div className="flex-shrink-0 flex items-center gap-2" style={{ minWidth: 80 }}>
          {hasNote ? (
            <div className="text-right">
              <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text)", fontWeight: "bold" }}>
                {ranking.objectiveNote != null ? `${ranking.objectiveNote}/10` : ""}
              </div>
              <div style={{ width: 60, height: 4, background: "var(--t-bg-dark)", marginTop: 2 }}>
                <div style={{ width: `${notePct}%`, height: "100%", background: "var(--t-accent)" }} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "calc(var(--t-text-xs) * 0.85)", color: "var(--t-text-muted)", fontStyle: "italic" }}>
              Pas de note
            </div>
          )}
        </div>
      </div>

      {/* Expanded edit area */}
      {expanded && (
        <div
          className="px-2 py-2 border-t"
          style={{ borderColor: "var(--t-border-dark)", background: "var(--t-bg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 flex-wrap">
            {/* Platform selector */}
            {platforms.length > 0 && (
              <div style={{ flex: "0 0 180px" }}>
                <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", display: "block", marginBottom: 2 }}>
                  Plateforme jouée :
                </label>
                <select
                  value={playedOn}
                  onChange={(e) => setPlayedOn(e.target.value)}
                  className="px-1 py-0.5"
                  style={{
                    fontSize: "var(--t-text-xs)",
                    background: "var(--t-app-bg)",
                    color: "var(--t-text)",
                    borderTop: "2px solid var(--t-border-dark)",
                    borderLeft: "2px solid var(--t-border-dark)",
                    borderBottom: "2px solid var(--t-border-light)",
                    borderRight: "2px solid var(--t-border-light)",
                    width: "100%",
                  }}
                >
                  <option value="">Non précisé</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Note slider */}
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", display: "block", marginBottom: 2 }}>
                Note objective : <strong>{noteValue}/10</strong>
              </label>
              <input
                type="range"
                min={0} max={10} step={1}
                value={noteValue}
                onChange={(e) => setNoteValue(parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
              <div className="flex justify-between" style={{ fontSize: "calc(var(--t-text-xs) * 0.75)", color: "var(--t-text-muted)" }}>
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            {/* Tier move */}
            {onMove && (
              <div style={{ flex: "0 0 180px" }}>
                <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", display: "block", marginBottom: 2 }}>
                  Déplacer vers :
                </label>
                <select
                  value={moveTier ?? ""}
                  onChange={(e) => setMoveTier(e.target.value as TierId)}
                  className="px-1 py-0.5"
                  style={{
                    fontSize: "var(--t-text-xs)",
                    background: "var(--t-app-bg)",
                    color: "var(--t-text)",
                    borderTop: "2px solid var(--t-border-dark)",
                    borderLeft: "2px solid var(--t-border-dark)",
                    borderBottom: "2px solid var(--t-border-light)",
                    borderRight: "2px solid var(--t-border-light)",
                    width: "100%",
                  }}
                >
                  <option value="">Choisir un tier...</option>
                  {TIERS.filter((t) => t.id !== ranking.tier).map((t) => (
                    <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                  ))}
                </select>
                {moveTier && (
                  <button
                    onClick={handleMove}
                    className="mt-1 px-2 py-0.5"
                    style={{
                      fontSize: "var(--t-text-xs)",
                      background: "var(--t-accent)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Déplacer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Personal note */}
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", display: "block", marginBottom: 2 }}>
              Note perso :
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ce qui te passe par la tête sur ce jeu..."
              className="w-full p-2"
              style={{
                fontSize: "var(--t-text-xs)",
                background: "var(--t-app-bg)",
                color: "var(--t-text)",
                borderTop: "2px solid var(--t-border-dark)",
                borderLeft: "2px solid var(--t-border-dark)",
                borderBottom: "2px solid var(--t-border-light)",
                borderRight: "2px solid var(--t-border-light)",
                resize: "vertical",
                height: 72,
                fontFamily: "inherit",
              }}
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 font-bold"
              style={{
                fontSize: "var(--t-text-xs)",
                background: "var(--t-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Sauvegarder
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1"
              style={{
                fontSize: "var(--t-text-xs)",
                background: "var(--t-bg-dark)",
                color: "var(--t-text)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <div className="flex-1" />
            {onRemove && (
              <button
                onClick={() => onRemove(ranking.gameId)}
                className="px-3 py-1"
                style={{
                  fontSize: "var(--t-text-xs)",
                  background: "var(--t-error)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Retirer du classement
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
