"use client";

import { TIERS, type RankingEntry } from "../constants";
import type { UserInfo } from "../hooks/use-gunthrank-data";

interface OverlayViewProps {
  rankings: RankingEntry[];
  viewMode: "mine" | "other";
  viewedUser: UserInfo | null;
  onExit: () => void;
}

export function OverlayView({ rankings, viewMode, viewedUser, onExit }: OverlayViewProps) {
  return (
    <div
      className="h-full flex flex-col relative"
      style={{
        background: "#111",
        color: "#fff",
        fontFamily: "var(--t-font-display)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid #333" }}
      >
        <span style={{ fontSize: "var(--t-text-xl)", fontWeight: "bold" }}>
          {viewMode === "other" && viewedUser
            ? `Classement de ${viewedUser.username ?? viewedUser.name}`
            : "Mon classement"}
        </span>
        <button
          onClick={onExit}
          className="px-4 py-1"
          style={{
            background: "#333",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "var(--t-text-sm)",
          }}
        >
          ✕ Quitter
        </button>
      </div>

      {/* Tier rows (compact) */}
      <div className="flex flex-col gap-1 p-4 overflow-auto flex-1">
        {TIERS.map((tier) => {
          const tierGames = rankings.filter((r) => r.tier === tier.id).sort((a, b) => a.sortOrder - b.sortOrder);
          return (
            <div key={tier.id} className="flex items-start gap-3" style={{ minHeight: 50 }}>
              <div
                className="flex items-center gap-1 flex-shrink-0"
                style={{ width: 160, fontSize: "var(--t-text-sm)", fontWeight: "bold" }}
              >
                <span>{tier.emoji}</span>
                <span style={{ color: tier.color }}>{tier.label}</span>
                <span className="opacity-50">({tierGames.length})</span>
              </div>
              <div className="flex gap-1 flex-wrap flex-1">
                {tierGames.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 px-2 py-1 flex-shrink-0"
                    style={{ background: "#1a1a1a", fontSize: "var(--t-text-xs)" }}
                  >
                    {r.game?.coverUrl ? (
                      <img
                        src={r.game.coverUrl}
                        alt={r.game.name}
                        style={{ width: 24, height: 30, objectFit: "cover" }}
                      />
                    ) : (
                      <span>🎮</span>
                    )}
                    <span>{r.game?.name ?? "?"}</span>
                    {r.objectiveNote != null && (
                      <span className="opacity-60">{r.objectiveNote}/10</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
