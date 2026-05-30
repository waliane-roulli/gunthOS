"use client";

import { useState, useEffect } from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { getPlatformColor, type RankingEntry } from "../constants";

interface GameDetailModalProps {
  ranking: RankingEntry;
  readOnly?: boolean;
  onClose: () => void;
  onRemove?: (gameId: number) => void;
}

export function GameDetailModal({ ranking, readOnly, onClose, onRemove }: GameDetailModalProps) {
  const { playClick, playDelete } = useSoundContext();
  const game = ranking.game!;
  const [commStats, setCommStats] = useState<{ avgNote: number | null; count: number } | null>(null);

  useEffect(() => {
    fetch(`/api/gunthrank/games/${game.id}/community-stats`)
      .then((r) => r.json())
      .then((d) => setCommStats(d as { avgNote: number | null; count: number }))
      .catch(() => {});
  }, [game.id]);

  const platforms: string[] = (() => {
    if (!game.platforms) return [];
    try { return JSON.parse(game.platforms); } catch { return []; }
  })();

  const genres: string[] = (() => {
    if (!game.genres) return [];
    try { return JSON.parse(game.genres); } catch { return []; }
  })();

  return (
    <div
      className="absolute inset-0 z-20 flex items-start justify-center"
      style={{ paddingTop: 60 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative flex flex-col gap-3 p-4 overflow-auto"
        style={{
          background: "var(--t-bg)",
          borderTop: "2px solid var(--t-border-light)",
          borderLeft: "2px solid var(--t-border-light)",
          borderBottom: "2px solid var(--t-border-dark)",
          borderRight: "2px solid var(--t-border-dark)",
          width: 480,
          maxHeight: "calc(100% - 100px)",
          color: "var(--t-text)",
          fontSize: "var(--t-text-sm)",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => { playClick(); onClose(); }}
          className="absolute top-2 right-2 px-2 py-0.5 font-bold"
          style={{
            fontSize: "var(--t-text-xs)",
            background: "var(--t-bg-dark)",
            color: "var(--t-text)",
            borderTop: "2px solid var(--t-border-light)",
            borderLeft: "2px solid var(--t-border-light)",
            borderBottom: "2px solid var(--t-border-dark)",
            borderRight: "2px solid var(--t-border-dark)",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {/* Cover art */}
        <div className="flex justify-center">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.name}
              style={{
                maxHeight: 200,
                objectFit: "contain",
                border: "2px solid var(--t-border-dark)",
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: 140,
                height: 200,
                background: "var(--t-bg-dark)",
                border: "2px solid var(--t-border-dark)",
                fontSize: "var(--t-text-3xl)",
              }}
            >
              🎮
            </div>
          )}
        </div>

        {/* Name */}
        <h2 style={{ fontSize: "var(--t-text-lg)", fontWeight: 700, textAlign: "center" }}>
          {game.name}
          {game.releaseDate && (
            <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginLeft: 8 }}>
              ({game.releaseDate})
            </span>
          )}
        </h2>

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {platforms.map((p) => {
              const color = getPlatformColor(p);
              return (
                <span
                  key={p}
                  className="px-2 py-0.5"
                  style={{
                    fontSize: "var(--t-text-xs)",
                    background: color ? `${color}44` : "var(--t-bg-dark)",
                    color: color ?? "var(--t-text)",
                    border: `1px solid ${color ?? "var(--t-border-dark)"}`,
                  }}
                >
                  {p}
                </span>
              );
            })}
          </div>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            {genres.join(" · ")}
          </div>
        )}

        {/* Summary — French if available, otherwise English */}
        {(game.summaryFr || game.summary) && (
          <div>
            <div style={{ fontSize: "var(--t-text-xs)", fontWeight: 600, marginBottom: 4 }}>
              Résumé
            </div>
            <p style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.5 }}>
              {(() => {
                const text = game.summaryFr ?? game.summary!;
                return text.length > 600 ? text.slice(0, 600) + "…" : text;
              })()}
            </p>
            {game.summaryFr && game.summary && (
              <details style={{ marginTop: 4 }}>
                <summary style={{ fontSize: "calc(var(--t-text-xs) * 0.8)", color: "var(--t-text-muted)", cursor: "pointer" }}>
                  Voir l'original (EN)
                </summary>
                <p style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", lineHeight: 1.5, marginTop: 4 }}>
                  {game.summary.length > 600 ? game.summary.slice(0, 600) + "…" : game.summary}
                </p>
              </details>
            )}
          </div>
        )}

        <hr style={{ borderColor: "var(--t-border-dark)" }} />

        {/* User's note */}
        <div>
          <div style={{ fontSize: "var(--t-text-xs)", fontWeight: 600, marginBottom: 4 }}>
            Ma note
          </div>
          <div className="flex items-center gap-3">
            {ranking.objectiveNote != null ? (
              <>
                <span style={{ fontSize: "var(--t-text-md)", fontWeight: 700 }}>
                  {ranking.objectiveNote}/10
                </span>
                <div
                  className="flex-1"
                  style={{
                    height: 8,
                    background: "var(--t-bg-dark)",
                    border: "1px solid var(--t-border-dark)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(ranking.objectiveNote / 10) * 100}%`,
                      background: "var(--t-accent)",
                    }}
                  />
                </div>
              </>
            ) : (
              <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                Pas encore noté
              </span>
            )}
          </div>
          {ranking.noteText && (
            <p style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginTop: 4, fontStyle: "italic" }}>
              &ldquo;{ranking.noteText}&rdquo;
            </p>
          )}
        </div>

        {/* Community stats */}
        <div>
          <div style={{ fontSize: "var(--t-text-xs)", fontWeight: 600, marginBottom: 4 }}>
            Communauté
          </div>
          {commStats ? (
            commStats.count > 0 ? (
              <span style={{ fontSize: "var(--t-text-sm)" }}>
                Moyenne : <strong>{commStats.avgNote}/10</strong> ({commStats.count} vote{commStats.count > 1 ? "s" : ""})
              </span>
            ) : (
              <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                Pas encore noté par la communauté
              </span>
            )
          ) : (
            <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
              Chargement...
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!readOnly && onRemove && (
            <button
              onClick={() => { playDelete(); onRemove(game.id); onClose(); }}
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
          <div className="flex-1" />
          <button
            onClick={() => { playClick(); onClose(); }}
            className="px-3 py-1"
            style={{
              fontSize: "var(--t-text-xs)",
              background: "var(--t-bg-dark)",
              color: "var(--t-text)",
              borderTop: "2px solid var(--t-border-light)",
              borderLeft: "2px solid var(--t-border-light)",
              borderBottom: "2px solid var(--t-border-dark)",
              borderRight: "2px solid var(--t-border-dark)",
              cursor: "pointer",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
