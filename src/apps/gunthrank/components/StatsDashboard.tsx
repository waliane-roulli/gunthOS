"use client";

import { useMemo } from "react";
import { TIERS, type RankingEntry } from "../constants";

interface StatsDashboardProps {
  rankings: RankingEntry[];
  allPlatforms: string[];
  allGenres: string[];
  onClose: () => void;
}

export function StatsDashboard({ rankings, allPlatforms, allGenres, onClose }: StatsDashboardProps) {
  const stats = useMemo(() => {
    const tierCounts: Record<string, number> = { diamond: 0, gold: 0, silver: 0, bronze: 0, banger: 0, caca: 0 };
    const platformCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    let totalNotes = 0;
    let noteCount = 0;

    for (const r of rankings) {
      tierCounts[r.tier] = (tierCounts[r.tier] ?? 0) + 1;
      if (r.objectiveNote != null) { totalNotes += r.objectiveNote; noteCount++; }
      if (r.game?.platforms) {
        const platforms: string[] = JSON.parse(r.game.platforms);
        for (const p of platforms) platformCounts[p] = (platformCounts[p] ?? 0) + 1;
      }
      if (r.game?.genres) {
        const genres: string[] = JSON.parse(r.game.genres);
        for (const g of genres) genreCounts[g] = (genreCounts[g] ?? 0) + 1;
      }
    }

    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0] ?? null;
    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0] ?? null;

    return { tierCounts, platformCounts, genreCounts, topPlatform, topGenre, totalNotes, noteCount, total: rankings.length };
  }, [rankings]);

  const maxTier = Math.max(1, ...Object.values(stats.tierCounts));

  return (
    <div
      className="mx-3 mt-2 p-4 rounded"
      style={{
        background: "var(--t-card-bg)",
        borderTop: "2px solid var(--t-border-light)",
        borderLeft: "2px solid var(--t-border-light)",
        borderBottom: "2px solid var(--t-border-dark)",
        borderRight: "2px solid var(--t-border-dark)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold" }}>Statistiques</span>
        <button
          onClick={onClose}
          style={{
            fontSize: "var(--t-text-xs)",
            background: "var(--t-bg-dark)",
            color: "var(--t-text)",
            border: "none",
            cursor: "pointer",
            padding: "2px 8px",
          }}
        >
          Fermer
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Tier distribution */}
        <div style={{ flex: "1 1 250px" }}>
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 4 }}>
            Distribution des tiers
          </div>
          {TIERS.map((tier) => (
            <div key={tier.id} className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: "var(--t-text-xs)", width: 24 }}>{tier.emoji}</span>
              <div className="flex-1 h-3" style={{ background: "var(--t-bg-dark)" }}>
                <div
                  className="h-full"
                  style={{
                    width: `${((stats.tierCounts[tier.id] ?? 0) / maxTier) * 100}%`,
                    background: tier.color,
                    minWidth: (stats.tierCounts[tier.id] ?? 0) > 0 ? 8 : 0,
                  }}
                />
              </div>
              <span style={{ fontSize: "var(--t-text-xs)", width: 24, textAlign: "right" }}>
                {stats.tierCounts[tier.id]}
              </span>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 4 }}>Résumé</div>
          <div style={{ fontSize: "var(--t-text-sm)" }}>
            <strong>{stats.total}</strong> jeux classés
          </div>
          {stats.topPlatform && (
            <div style={{ fontSize: "var(--t-text-sm)" }}>
              Plateforme préférée : <strong>{stats.topPlatform[0]}</strong> ({stats.topPlatform[1]} jeux)
            </div>
          )}
          {stats.topGenre && (
            <div style={{ fontSize: "var(--t-text-sm)" }}>
              Genre de prédilection : <strong>{stats.topGenre[0]}</strong> ({stats.topGenre[1]} jeux)
            </div>
          )}
          {stats.noteCount > 0 && (
            <div style={{ fontSize: "var(--t-text-sm)" }}>
              Note moyenne : <strong>{(stats.totalNotes / stats.noteCount).toFixed(1)}/10</strong> ({stats.noteCount} jeux notés)
            </div>
          )}
        </div>

        {/* Platform breakdown */}
        {allPlatforms.length > 0 && (
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 4 }}>Plateformes</div>
            {Object.entries(stats.platformCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([p, c]) => (
                <div key={p} style={{ fontSize: "var(--t-text-xs)" }}>
                  {p}: <strong>{c}</strong>
                </div>
              ))}
          </div>
        )}

        {/* Genre breakdown */}
        {allGenres.length > 0 && (
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 4 }}>Genres</div>
            {Object.entries(stats.genreCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([g, c]) => (
                <div key={g} style={{ fontSize: "var(--t-text-xs)" }}>
                  {g}: <strong>{c}</strong>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
