"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useOpenApp } from "@/lib/hooks/use-open-app";
import { useNotify } from "@/lib/contexts/notification-context";
import { useGunthrankData } from "./hooks/use-gunthrank-data";
import { TierRow } from "./components/TierRow";
import { FilterBar } from "./components/FilterBar";
import { AddGameDialog } from "./components/AddGameDialog";
import { StatsDashboard } from "./components/StatsDashboard";
import { OverlayView } from "./components/OverlayView";
import { TIERS, type TierId, type IgdbSearchResult } from "./constants";

export function GunthrankApp({ windowId }: { windowId: string }) {
  const { user } = useAuth();
  const { playClick, playPop, playVictory, playDelete } = useSoundContext();
  const { openApp } = useOpenApp();
  const notify = useNotify();
  const tierListRef = useRef<HTMLDivElement>(null);

  const {
    viewMode, setViewMode,
    rankings, loading,
    gunthosInfo,
    filters, setFilters,
    allPlatforms, allGenres, allYears,
    searchIgdb,
    addGame, removeRanking, moveGame, updateNote,
  } = useGunthrankData();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const readOnly = viewMode === "gunthos";

  const handleMoveGame = (rankingId: number, toTier: TierId) => {
    const entry = rankings.find((r) => r.id === rankingId);
    if (!entry) return;
    const oldTier = entry.tier;
    moveGame(rankingId, toTier, 0);
    if (toTier === "diamond" && oldTier !== "diamond") playVictory();
    else if (toTier === "caca" && oldTier !== "caca") playDelete();
    else playPop();
  };

  const handleAddGame = async (igdbGame: IgdbSearchResult, tier: TierId) => {
    playPop();
    await addGame({
      igdbId: igdbGame.igdbId,
      name: igdbGame.name,
      slug: igdbGame.slug,
      coverUrl: igdbGame.coverUrl,
      platforms: igdbGame.platforms,
      genres: igdbGame.genres,
      releaseDate: igdbGame.releaseYear,
      summary: igdbGame.summary,
      tier,
    });
    setShowAddDialog(false);
    notify({ type: "success", title: `${igdbGame.name} ajouté au ${TIERS.find((t) => t.id === tier)?.label ?? tier} !` });
  };

  const handleExport = async () => {
    if (!tierListRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(tierListRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "kiffotheque.png";
      a.click();
      playVictory();
      notify({ type: "success", title: "Image exportée !" });
    } catch (e) {
      notify({ type: "error", title: "Erreur d'export..." });
    }
  };

  const handleRemove = async (gameId: number) => {
    playDelete();
    await removeRanking(gameId);
    notify({ type: "info", title: "Jeu retiré du classement" });
  };

  if (showOverlay) {
    return (
      <OverlayView
        rankings={rankings}
        viewMode={viewMode}
        gunthosInfo={gunthosInfo}
        onExit={() => setShowOverlay(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--t-app-bg)" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
        style={{ borderBottom: "1px solid var(--t-border-dark)" }}
      >
        {/* View toggle */}
        <div
          className="flex"
          style={{
            borderTop: "2px solid var(--t-border-light)",
            borderLeft: "2px solid var(--t-border-light)",
            borderBottom: "2px solid var(--t-border-dark)",
            borderRight: "2px solid var(--t-border-dark)",
          }}
        >
          <button
            onClick={() => { playClick(); setViewMode("mine"); }}
            className="px-3 py-1"
            style={{
              fontSize: "var(--t-text-xs)",
              background: viewMode === "mine" ? "var(--t-bg)" : "var(--t-bg-dark)",
              color: "var(--t-text)",
              border: "none",
              cursor: "pointer",
              ...(viewMode === "mine" ? {
                borderTop: "2px solid var(--t-border-dark)",
                borderLeft: "2px solid var(--t-border-dark)",
                borderBottom: "2px solid var(--t-border-light)",
                borderRight: "2px solid var(--t-border-light)",
              } : {}),
            }}
          >
            Mon classement
          </button>
          <button
            onClick={() => { playClick(); setViewMode("gunthos"); }}
            className="px-3 py-1"
            style={{
              fontSize: "var(--t-text-xs)",
              background: viewMode === "gunthos" ? "var(--t-bg)" : "var(--t-bg-dark)",
              color: "var(--t-text)",
              border: "none",
              cursor: "pointer",
              ...(viewMode === "gunthos" ? {
                borderTop: "2px solid var(--t-border-dark)",
                borderLeft: "2px solid var(--t-border-dark)",
                borderBottom: "2px solid var(--t-border-light)",
                borderRight: "2px solid var(--t-border-light)",
              } : {}),
            }}
          >
            Classement de Gunthos
          </button>
        </div>

        <div className="flex-1" />

        {!readOnly && (
          <button
            onClick={() => { playClick(); setShowAddDialog(true); }}
            className="px-3 py-1 font-bold"
            style={{
              fontSize: "var(--t-text-xs)",
              background: "var(--t-accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Ajouter
          </button>
        )}

        <button
          onClick={() => { playClick(); setShowStats(!showStats); }}
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
          {showStats ? "Fermer stats" : "Stats"}
        </button>

        <button
          onClick={() => setShowOverlay(true)}
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
          Overlay
        </button>

        <button
          onClick={handleExport}
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
          Export PNG
        </button>
      </div>

      {/* Read-only banner */}
      {readOnly && gunthosInfo && (
        <div
          className="px-3 py-1 text-center"
          style={{
            fontSize: "var(--t-text-xs)",
            color: "var(--t-text-muted)",
            background: "var(--t-bg)",
            borderBottom: "1px solid var(--t-border-dark)",
          }}
        >
          Consultation seule — Classement de {gunthosInfo.username ?? gunthosInfo.name}
        </div>
      )}

      {/* Stats panel */}
      {showStats && (
        <StatsDashboard
          rankings={rankings}
          allPlatforms={allPlatforms}
          allGenres={allGenres}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        allPlatforms={allPlatforms}
        allGenres={allGenres}
        allYears={allYears}
      />

      {/* Tier list */}
      <div ref={tierListRef} className="flex flex-col gap-3 p-3 overflow-auto flex-1 tier-list-root">
        {viewMode === "mine" && !user ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4" style={{ minHeight: 300 }}>
            <p style={{ fontSize: "var(--t-text-md)", color: "var(--t-text-muted)" }}>
              Connecte-toi pour créer ton classement !
            </p>
            <button
              onClick={() => openApp("login")}
              className="px-4 py-2 font-bold"
              style={{
                fontSize: "var(--t-text-sm)",
                background: "var(--t-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Se connecter
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center flex-1" style={{ minHeight: 300 }}>
            <span style={{ fontSize: "var(--t-text-md)", color: "var(--t-text-muted)" }}>
              Chargement...
            </span>
          </div>
        ) : (
          TIERS.map((tier) => {
            const tierGames = rankings.filter((r) => r.tier === tier.id);
            return (
              <TierRow
                key={tier.id}
                tier={tier}
                games={tierGames}
                readOnly={readOnly}
                onDrop={handleMoveGame}
                onRemove={handleRemove}
                onUpdateNote={updateNote}
              />
            );
          })
        )}
      </div>

      {/* Add Game Dialog */}
      {showAddDialog && (
        <AddGameDialog
          onAdd={handleAddGame}
          onClose={() => setShowAddDialog(false)}
          searchIgdb={searchIgdb}
        />
      )}
    </div>
  );
}
