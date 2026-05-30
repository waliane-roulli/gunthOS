"use client";

import { useState, useEffect, useRef } from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { TIERS, type TierId, type IgdbSearchResult } from "../constants";

interface AddGameDialogProps {
  onAdd: (game: IgdbSearchResult, tier: TierId) => void;
  onClose: () => void;
  searchIgdb: (query: string) => Promise<{ results: IgdbSearchResult[]; offline?: boolean }>;
}

export function AddGameDialog({ onAdd, onClose, searchIgdb }: AddGameDialogProps) {
  const { playClick } = useSoundContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IgdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [selectedGame, setSelectedGame] = useState<IgdbSearchResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierId>("diamond");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchIgdb(query);
      setResults(data.results);
      setOffline(!!data.offline);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchIgdb]);

  const handleConfirm = () => {
    if (selectedGame) {
      onAdd(selectedGame, selectedTier);
    }
  };

  return (
    <div
      className="absolute inset-0 z-10 flex items-start justify-center pt-20"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded p-4 flex flex-col gap-3"
        style={{
          background: "var(--t-bg)",
          borderTop: "2px solid var(--t-border-light)",
          borderLeft: "2px solid var(--t-border-light)",
          borderBottom: "2px solid var(--t-border-dark)",
          borderRight: "2px solid var(--t-border-dark)",
          width: 500,
          maxHeight: "70%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold" }}>Ajouter un jeu</span>
          <button
            onClick={onClose}
            style={{
              fontSize: "var(--t-text-sm)",
              background: "none",
              border: "none",
              color: "var(--t-text-muted)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un jeu..."
          className="px-3 py-2 w-full"
          style={{
            fontSize: "var(--t-text-sm)",
            background: "var(--t-app-bg)",
            color: "var(--t-text)",
            borderTop: "2px solid var(--t-border-dark)",
            borderLeft: "2px solid var(--t-border-dark)",
            borderBottom: "2px solid var(--t-border-light)",
            borderRight: "2px solid var(--t-border-light)",
          }}
        />

        {offline && (
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-warning)" }}>
            IGDB hors-ligne — utilise la recherche locale pour trouver des jeux déjà ajoutés.
          </div>
        )}

        {/* Results */}
        <div className="overflow-auto flex-1" style={{ maxHeight: 300 }}>
          {loading ? (
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>Recherche...</div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((game) => (
                <button
                  key={game.igdbId}
                  onClick={() => { playClick(); setSelectedGame(game); }}
                  className="flex items-center gap-3 p-2 rounded text-left w-full"
                  style={{
                    background: selectedGame?.igdbId === game.igdbId ? "var(--t-accent-hover)" : "var(--t-card-bg)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {game.coverUrl ? (
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      className="flex-shrink-0 object-cover"
                      style={{ width: 50, height: 70 }}
                    />
                  ) : (
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{ width: 50, height: 70, background: "var(--t-bg-dark)" }}
                    >
                      🎮
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold" }} className="truncate">
                      {game.name}
                    </div>
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                      {game.platforms.slice(0, 3).join(", ")}
                      {game.releaseYear ? ` — ${game.releaseYear}` : ""}
                    </div>
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                      {game.genres.slice(0, 3).join(", ")}
                    </div>
                  </div>
                </button>
              ))}
              {query.length >= 2 && results.length === 0 && !loading && (
                <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
                  Aucun résultat. {offline ? "Vérifie ta connexion." : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tier picker + confirm */}
        {selectedGame && (
          <div
            className="flex items-center gap-2 p-2 rounded"
            style={{ borderTop: "1px solid var(--t-border-dark)" }}
          >
            <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>Classer dans :</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as TierId)}
              style={{
                fontSize: "var(--t-text-xs)",
                background: "var(--t-bg)",
                color: "var(--t-text)",
                borderTop: "2px solid var(--t-border-dark)",
                borderLeft: "2px solid var(--t-border-dark)",
                borderBottom: "2px solid var(--t-border-light)",
                borderRight: "2px solid var(--t-border-light)",
                padding: "2px 6px",
              }}
            >
              {TIERS.map((t) => (
                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
              ))}
            </select>
            <div className="flex-1" />
            <button
              onClick={handleConfirm}
              className="px-4 py-1 font-bold"
              style={{
                fontSize: "var(--t-text-sm)",
                background: "var(--t-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
