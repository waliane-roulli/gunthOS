"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import type { RankingEntry, GameCatalogEntry, TierId, IgdbSearchResult, Filters } from "../constants";

export type { Filters, TierId };

const DEV_KEY = "gunthrank-dev-rankings";

function loadDevRankings(): RankingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DEV_KEY) ?? "[]");
  } catch { return []; }
}

function saveDevRankings(r: RankingEntry[]) {
  localStorage.setItem(DEV_KEY, JSON.stringify(r));
}

export function useGunthrankData() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"mine" | "gunthos">("mine");
  const [devMode, setDevMode] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<GameCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [gunthosInfo, setGunthosInfo] = useState<{ id: string; name: string; username: string | null } | null>(null);
  const [filters, setFilters] = useState<Filters>({ platform: null, genre: null, year: null, tiers: [] });

  // ── Dev mode: load from localStorage on mount ──
  useEffect(() => {
    if (devMode) setRankings(loadDevRankings());
  }, [devMode]);

  const fetchRankings = useCallback(async () => {
    if (devMode) { setRankings(loadDevRankings()); setLoading(false); return; }
    setLoading(true);
    try {
      if (viewMode === "gunthos") {
        const res = await fetch("/api/gunthrank/public");
        const data = await res.json() as { gunthos: { id: string; name: string; username: string | null } | null; rankings: RankingEntry[] };
        setGunthosInfo(data.gunthos);
        setRankings(data.rankings);
      } else if (user) {
        const res = await fetch("/api/gunthrank/rankings");
        const data = await res.json() as { rankings: RankingEntry[] };
        setRankings(data.rankings);
      } else {
        setRankings([]);
      }
    } finally {
      setLoading(false);
    }
  }, [viewMode, user, devMode]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const fetchGames = useCallback(async (q: string) => {
    if (devMode) {
      // In dev mode, games live inline in rankings — no catalog needed for "add from catalog"
      const res = await fetch(`/api/gunthrank/games?q=${encodeURIComponent(q)}`);
      const data = await res.json() as { games: GameCatalogEntry[] };
      return data.games;
    }
    const res = await fetch(`/api/gunthrank/games?q=${encodeURIComponent(q)}`);
    const data = await res.json() as { games: GameCatalogEntry[] };
    return data.games;
  }, [devMode]);

  const searchIgdb = useCallback(async (query: string) => {
    const res = await fetch("/api/igdb/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json() as { results: IgdbSearchResult[]; offline?: boolean };
    return data;
  }, []);

  const addGame = useCallback(async (gameData: {
    igdbId?: number | null;
    name: string;
    slug?: string | null;
    coverUrl?: string | null;
    platforms?: string[] | null;
    genres?: string[] | null;
    releaseDate?: number | null;
    summary?: string | null;
    tier: string;
    objectiveNote?: number | null;
    noteText?: string | null;
  }) => {
    if (devMode) {
      const devGame: GameCatalogEntry = {
        id: Date.now(),
        igdbId: gameData.igdbId ?? null,
        name: gameData.name,
        slug: gameData.slug ?? null,
        coverUrl: gameData.coverUrl ?? null,
        platforms: gameData.platforms ? JSON.stringify(gameData.platforms) : null,
        genres: gameData.genres ? JSON.stringify(gameData.genres) : null,
        releaseDate: gameData.releaseDate ?? null,
        summary: gameData.summary ?? null,
        createdAt: new Date(),
      };
      const devRanking: RankingEntry = {
        id: Date.now() + 1,
        userId: "dev",
        gameId: devGame.id,
        tier: gameData.tier,
        objectiveNote: gameData.objectiveNote ?? null,
        noteText: gameData.noteText ?? null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        game: devGame,
      };
      setRankings((prev) => { const next = [...prev, devRanking]; saveDevRankings(next); return next; });
      return devRanking;
    }

    // Add to catalog
    const gameRes = await fetch("/api/gunthrank/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        igdbId: gameData.igdbId,
        name: gameData.name,
        slug: gameData.slug,
        coverUrl: gameData.coverUrl,
        platforms: gameData.platforms,
        genres: gameData.genres,
        releaseDate: gameData.releaseDate,
        summary: gameData.summary,
      }),
    });
    const { game } = await gameRes.json() as { game: GameCatalogEntry };

    const rankRes = await fetch("/api/gunthrank/rankings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: game.id,
        tier: gameData.tier,
        objectiveNote: gameData.objectiveNote,
        noteText: gameData.noteText,
      }),
    });
    const { ranking } = await rankRes.json() as { ranking: RankingEntry };

    setRankings((prev) => [...prev, { ...ranking, game }]);
    return ranking;
  }, [devMode]);

  const addFromCatalog = useCallback(async (gameId: number, tier: string) => {
    if (devMode) {
      // In dev mode, games are inline — "catalog" drag creates a copy of an existing game
      const existing = rankings.find((r) => r.gameId === gameId);
      if (!existing?.game) return;
      const devRanking: RankingEntry = {
        id: Date.now(),
        userId: "dev",
        gameId: existing.gameId,
        tier,
        objectiveNote: null,
        noteText: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        game: existing.game,
      };
      setRankings((prev) => { const next = [...prev, devRanking]; saveDevRankings(next); return next; });
      return devRanking;
    }

    const rankRes = await fetch("/api/gunthrank/rankings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, tier }),
    });
    const { ranking } = await rankRes.json() as { ranking: RankingEntry };
    const gameRes = await fetch(`/api/gunthrank/games?q=${encodeURIComponent("")}`);
    const { games: allGames } = await gameRes.json() as { games: GameCatalogEntry[] };
    const game = allGames.find((g) => g.id === gameId) ?? null;
    setRankings((prev) => [...prev, { ...ranking, game }]);
    return ranking;
  }, [devMode, rankings]);

  const removeRanking = useCallback(async (gameId: number) => {
    if (devMode) {
      setRankings((prev) => { const next = prev.filter((r) => r.gameId !== gameId); saveDevRankings(next); return next; });
      return;
    }
    await fetch(`/api/gunthrank/rankings?gameId=${gameId}`, { method: "DELETE" });
    setRankings((prev) => prev.filter((r) => r.gameId !== gameId));
  }, [devMode]);

  const moveGame = useCallback(async (rankingId: number, toTier: string, toIndex: number) => {
    setRankings((prev) => {
      const entry = prev.find((r) => r.id === rankingId);
      if (!entry) return prev;
      const othersInTarget = prev.filter((r) => r.tier === toTier && r.id !== rankingId).sort((a, b) => a.sortOrder - b.sortOrder);
      const moved = { ...entry, tier: toTier as TierId, sortOrder: toIndex };
      const reordered = [
        ...othersInTarget.slice(0, toIndex),
        moved,
        ...othersInTarget.slice(toIndex),
      ];
      const updated = prev.map((r) => (r.id === rankingId ? { ...r, tier: toTier as TierId, sortOrder: toIndex } : r));
      if (devMode) {
        // Persist reordered rankings
        const full = updated.map((r) => {
          const inReorder = reordered.find((rr) => rr.id === r.id);
          return inReorder ? { ...r, sortOrder: inReorder.sortOrder } : r;
        });
        saveDevRankings(full);
        return full;
      }
      const updates = reordered.map((r, i) => ({ id: r.id, tier: r.tier, sortOrder: i }));
      fetch("/api/gunthrank/rankings/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      }).catch(() => {});
      return updated;
    });
  }, [devMode]);

  const updateNote = useCallback(async (rankingId: number, objectiveNote: number | null, noteText: string | null) => {
    setRankings((prev) => {
      const next = prev.map((r) =>
        r.id === rankingId ? { ...r, objectiveNote, noteText } : r
      );
      if (devMode) saveDevRankings(next);
      return next;
    });
    if (devMode) return;
    const entry = rankings.find((r) => r.id === rankingId);
    if (!entry) return;
    await fetch("/api/gunthrank/rankings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: entry.gameId, tier: entry.tier, objectiveNote, noteText }),
    });
  }, [rankings, devMode]);

  const filteredRankings = useMemo(() => {
    return rankings.filter((r) => {
      if (filters.tiers.length > 0 && !filters.tiers.includes(r.tier as TierId)) return false;
      const game = r.game;
      if (!game) return true;
      if (filters.platform && game.platforms) {
        const platforms: string[] = JSON.parse(game.platforms);
        if (!platforms.includes(filters.platform)) return false;
      }
      if (filters.genre && game.genres) {
        const genres: string[] = JSON.parse(game.genres);
        if (!genres.includes(filters.genre)) return false;
      }
      if (filters.year && game.releaseDate && game.releaseDate !== filters.year) return false;
      return true;
    });
  }, [rankings, filters]);

  const allPlatforms = useMemo(() => {
    const set = new Set<string>();
    rankings.forEach((r) => {
      if (r.game?.platforms) {
        (JSON.parse(r.game.platforms) as string[]).forEach((p) => set.add(p));
      }
    });
    return [...set].sort();
  }, [rankings]);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    rankings.forEach((r) => {
      if (r.game?.genres) {
        (JSON.parse(r.game.genres) as string[]).forEach((g) => set.add(g));
      }
    });
    return [...set].sort();
  }, [rankings]);

  const allYears = useMemo(() => {
    const set = new Set<number>();
    rankings.forEach((r) => {
      if (r.game?.releaseDate) set.add(r.game.releaseDate);
    });
    return [...set].sort((a, b) => b - a);
  }, [rankings]);

  return {
    viewMode, setViewMode,
    devMode, setDevMode,
    rankings: filteredRankings,
    allRankings: rankings,
    loading,
    gunthosInfo,
    filters, setFilters,
    allPlatforms, allGenres, allYears,
    fetchGames, searchIgdb,
    addGame, addFromCatalog, removeRanking, moveGame, updateNote,
  };
}
