"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import type { RankingEntry, GameCatalogEntry, TierId, IgdbSearchResult, Filters } from "../constants";

export type { Filters, TierId };

export function useGunthrankData() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"mine" | "gunthos">("mine");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [games, setGames] = useState<GameCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [gunthosInfo, setGunthosInfo] = useState<{ id: string; name: string; username: string | null } | null>(null);
  const [filters, setFilters] = useState<Filters>({ platform: null, genre: null, year: null, tiers: [] });

  const fetchRankings = useCallback(async () => {
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
  }, [viewMode, user]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const fetchGames = useCallback(async (q: string) => {
    const res = await fetch(`/api/gunthrank/games?q=${encodeURIComponent(q)}`);
    const data = await res.json() as { games: GameCatalogEntry[] };
    return data.games;
  }, []);

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

    // Add ranking
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
  }, []);

  const removeRanking = useCallback(async (gameId: number) => {
    await fetch(`/api/gunthrank/rankings?gameId=${gameId}`, { method: "DELETE" });
    setRankings((prev) => prev.filter((r) => r.gameId !== gameId));
  }, []);

  const moveGame = useCallback(async (rankingId: number, toTier: string, toIndex: number) => {
    let entry: RankingEntry | undefined;
    setRankings((prev) => {
      entry = prev.find((r) => r.id === rankingId);
      if (!entry) return prev;
      const othersInTarget = prev.filter((r) => r.tier === toTier && r.id !== rankingId).sort((a, b) => a.sortOrder - b.sortOrder);
      const moved = { ...entry, tier: toTier as TierId, sortOrder: toIndex };
      const reordered = [
        ...othersInTarget.slice(0, toIndex),
        moved,
        ...othersInTarget.slice(toIndex),
      ];
      const updates = reordered.map((r, i) => ({ id: r.id, tier: r.tier, sortOrder: i }));
      // Send batch update
      fetch("/api/gunthrank/rankings/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      }).catch(() => {});
      return prev.map((r) => (r.id === rankingId ? { ...r, tier: toTier as TierId, sortOrder: toIndex } : r));
    });
  }, []);

  const updateNote = useCallback(async (rankingId: number, objectiveNote: number | null, noteText: string | null) => {
    setRankings((prev) =>
      prev.map((r) =>
        r.id === rankingId ? { ...r, objectiveNote, noteText } : r
      )
    );
    // Find the ranking to get gameId
    const entry = rankings.find((r) => r.id === rankingId);
    if (!entry) return;
    await fetch("/api/gunthrank/rankings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: entry.gameId, tier: entry.tier, objectiveNote, noteText }),
    });
  }, [rankings]);

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
    rankings: filteredRankings,
    allRankings: rankings,
    loading,
    gunthosInfo,
    filters, setFilters,
    allPlatforms, allGenres, allYears,
    fetchGames, searchIgdb,
    addGame, removeRanking, moveGame, updateNote,
  };
}
