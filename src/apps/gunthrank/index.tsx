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
import { CatalogPanel } from "./components/CatalogPanel";
import { TIERS, type TierId, type IgdbSearchResult } from "./constants";

export function GunthrankApp({ windowId }: { windowId: string }) {
  const { user } = useAuth();
  const { playClick, playPop, playVictory, playDelete } = useSoundContext();
  const { openApp } = useOpenApp();
  const notify = useNotify();
  const tierListRef = useRef<HTMLDivElement>(null);

  const {
    viewMode,
    devMode, setDevMode,
    rankings, loading,
    viewedUser,
    availableUsers, fetchAvailableUsers,
    selectUser, goToMyRankings,
    filters, setFilters,
    allPlatforms, allGenres, allYears,
    searchIgdb,
    addGame, addFromCatalog, removeRanking, moveGame, updateNote,
  } = useGunthrankData();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCatalog, setShowCatalog] = useState(true);
  const [viewLayout, setViewLayout] = useState<"list" | "grid">(() => {
    try { return (localStorage.getItem("gunthrank-view-layout") as "list" | "grid") ?? "list"; } catch { return "list"; }
  });

  const toggleViewLayout = () => {
    const next = viewLayout === "list" ? "grid" : "list";
    setViewLayout(next);
    try { localStorage.setItem("gunthrank-view-layout", next); } catch { /* noop */ }
  };

  const readOnly = viewMode === "other" && !devMode;

  const handleOpenUserPicker = () => {
    fetchAvailableUsers();
  };

  const handleMoveGame = (rankingId: number, toTier: TierId) => {
    const entry = rankings.find((r) => r.id === rankingId);
    if (!entry) return;
    const oldTier = entry.tier;
    moveGame(rankingId, toTier, 0);
    if (toTier === "diamond" && oldTier !== "diamond") playVictory();
    else if (toTier === "caca" && oldTier !== "caca") playDelete();
    else playPop();
  };

  const handleMoveToTier = (rankingId: number, toTier: TierId) => {
    const entry = rankings.find((r) => r.id === rankingId);
    if (!entry) return;
    moveGame(rankingId, toTier, 0);
    playPop();
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

  const handleAddFromCatalog = async (gameId: number, toTier: TierId) => {
    playPop();
    await addFromCatalog(gameId, toTier);
    notify({ type: "success", title: "Ajouté au classement !" });
  };

  const handleAddFromIgdb = async (igdbGame: IgdbSearchResult, toTier: TierId) => {
    playPop();
    if (devMode) {
      // In dev mode, store directly with IGDB data embedded
      await addGame({
        igdbId: igdbGame.igdbId,
        name: igdbGame.name,
        slug: igdbGame.slug,
        coverUrl: igdbGame.coverUrl,
        platforms: igdbGame.platforms,
        genres: igdbGame.genres,
        releaseDate: igdbGame.releaseYear,
        summary: igdbGame.summary,
        tier: toTier,
      });
    } else {
      // Add to catalog first, then create ranking
      const gameRes = await fetch("/api/gunthrank/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          igdbId: igdbGame.igdbId,
          name: igdbGame.name,
          slug: igdbGame.slug,
          coverUrl: igdbGame.coverUrl,
          platforms: igdbGame.platforms,
          genres: igdbGame.genres,
          releaseDate: igdbGame.releaseYear,
          summary: igdbGame.summary,
        }),
      });
      const { game } = await gameRes.json() as { game: { id: number } };
      await addFromCatalog(game.id, toTier);
    }
    notify({ type: "success", title: `${igdbGame.name} ajouté !` });
  };

  if (showOverlay) {
    return (
      <OverlayView
        rankings={rankings}
        viewMode={viewMode}
        viewedUser={viewedUser}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { playClick(); goToMyRankings(); }}
            className="px-3 py-1"
            style={{
              fontSize: "var(--t-text-xs)",
              background: viewMode === "mine" ? "var(--t-bg)" : "var(--t-bg-dark)",
              color: "var(--t-text)",
              borderTop: viewMode === "mine" ? "2px solid var(--t-border-dark)" : "2px solid var(--t-border-light)",
              borderLeft: viewMode === "mine" ? "2px solid var(--t-border-dark)" : "2px solid var(--t-border-light)",
              borderBottom: viewMode === "mine" ? "2px solid var(--t-border-light)" : "2px solid var(--t-border-dark)",
              borderRight: viewMode === "mine" ? "2px solid var(--t-border-light)" : "2px solid var(--t-border-dark)",
              cursor: "pointer",
            }}
          >
            Mon classement
          </button>
          <select
            value={viewMode === "other" && viewedUser ? viewedUser.id : ""}
            onChange={(e) => {
              if (!e.target.value) return;
              playClick();
              selectUser(e.target.value);
            }}
            onFocus={handleOpenUserPicker}
            className="px-2 py-1"
            style={{
              fontSize: "var(--t-text-xs)",
              background: viewMode === "other" ? "var(--t-bg)" : "var(--t-bg-dark)",
              color: "var(--t-text)",
              borderTop: viewMode === "other" ? "2px solid var(--t-border-dark)" : "2px solid var(--t-border-light)",
              borderLeft: viewMode === "other" ? "2px solid var(--t-border-dark)" : "2px solid var(--t-border-light)",
              borderBottom: viewMode === "other" ? "2px solid var(--t-border-light)" : "2px solid var(--t-border-dark)",
              borderRight: viewMode === "other" ? "2px solid var(--t-border-light)" : "2px solid var(--t-border-dark)",
              cursor: "pointer",
              maxWidth: 200,
            }}
          >
            <option value="">Voir un classement...</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username ?? u.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { playClick(); setDevMode(!devMode); }}
          className="px-2 py-1 font-bold"
          style={{
            fontSize: "var(--t-text-xs)",
            background: devMode ? "#ff3300" : "var(--t-bg-dark)",
            color: devMode ? "#fff" : "var(--t-text-muted)",
            border: "none",
            cursor: "pointer",
          }}
        >
          DEV
        </button>

        <button
          onClick={() => { playClick(); toggleViewLayout(); }}
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
          {viewLayout === "list" ? "📋 Liste" : "⊞ Grille"}
        </button>

        <div className="flex-1" />

        {!readOnly && (
          <>
            <button
              onClick={() => { playClick(); setShowCatalog(!showCatalog); }}
              className="px-3 py-1"
              style={{
                fontSize: "var(--t-text-xs)",
                background: showCatalog ? "var(--t-accent)" : "var(--t-bg-dark)",
                color: showCatalog ? "#fff" : "var(--t-text)",
                borderTop: "2px solid var(--t-border-light)",
                borderLeft: "2px solid var(--t-border-light)",
                borderBottom: "2px solid var(--t-border-dark)",
                borderRight: "2px solid var(--t-border-dark)",
                cursor: "pointer",
              }}
            >
              Catalogue
            </button>
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
          </>
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

      {/* Dev mode banner */}
      {devMode && (
        <div
          className="px-3 py-1 text-center font-bold"
          style={{
            fontSize: "var(--t-text-xs)",
            color: "#fff",
            background: "#ff3300",
            borderBottom: "1px solid var(--t-border-dark)",
          }}
        >
          MODE DEV — Données stockées en localStorage (pas d'auth requise)
        </div>
      )}

      {/* Read-only banner */}
      {readOnly && viewedUser && (
        <div
          className="px-3 py-1 text-center"
          style={{
            fontSize: "var(--t-text-xs)",
            color: "var(--t-text-muted)",
            background: "var(--t-bg)",
            borderBottom: "1px solid var(--t-border-dark)",
          }}
        >
          Consultation seule — Classement de {viewedUser.username ?? viewedUser.name}
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

      {/* Tier list + Catalog */}
      <div className="flex flex-1 overflow-hidden">
        {showCatalog && !readOnly && (
          <CatalogPanel onClose={() => setShowCatalog(false)} />
        )}
        <div ref={tierListRef} className="flex flex-col gap-3 p-3 overflow-auto flex-1 tier-list-root">
          {viewMode === "mine" && !user && !devMode ? (
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
                  viewLayout={viewLayout}
                  onDrop={handleMoveGame}
                  onAddFromCatalog={handleAddFromCatalog}
                  onAddFromIgdb={handleAddFromIgdb}
                  onRemove={handleRemove}
                  onUpdateNote={updateNote}
                  onMove={handleMoveToTier}
                />
              );
            })
          )}
        </div>
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
