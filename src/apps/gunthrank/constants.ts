import type { gunthrankGames, gunthrankRankings } from "@/lib/db/schema";

export const TIERS = [
  { id: "diamond", label: "Kiff de Diamant", emoji: "💎", color: "#4facfe" },
  { id: "gold", label: "Kiff d'Or", emoji: "🥇", color: "#f9d423" },
  { id: "silver", label: "Kiff d'Argent", emoji: "🥈", color: "#bdc3c7" },
  { id: "bronze", label: "Kiff de Bronze", emoji: "🥉", color: "#cd7f32" },
  { id: "banger", label: "Banger du Cul", emoji: "🍑", color: "#e74c3c" },
  { id: "caca", label: "Kiff Caca d'Or", emoji: "💩", color: "#8b7355" },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export type GameCatalogEntry = typeof gunthrankGames.$inferSelect;

export type RankingRow = typeof gunthrankRankings.$inferSelect;

export interface RankingEntry extends RankingRow {
  game: GameCatalogEntry | null;
}

export interface IgdbSearchResult {
  igdbId: number;
  name: string;
  slug: string | null;
  coverUrl: string | null;
  platforms: string[];
  genres: string[];
  publishers: string[];
  developers: string[];
  releaseYear: number | null;
  summary: string | null;
}

export interface Filters {
  platform: string | null;
  genre: string | null;
  year: number | null;
  tiers: TierId[];
}
