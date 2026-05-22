"use client";

import { useRef, useCallback, useState } from "react";
import type { AppProps } from "@/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { useMusic } from "./useMusic";
import { useGameLoop } from "./useGameLoop";
import { GameHud } from "./components/GameHud";
import { GameCanvas } from "./components/GameCanvas";
import { Leaderboard } from "./components/Leaderboard";
import { W, H } from "./constants";
import type { UiState, LeaderboardEntry } from "./types";

export function PeggleApp({ windowId: _windowId }: AppProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: W / 2, y: 0 });

  const [tab, setTab] = useState<"game" | "leaderboard">("game");
  const [ui, setUi] = useState<UiState>({
    balls: 10, score: 0, orangeLeft: 0, orangeTotal: 0,
    phase: "aim", message: "", combo: 0, level: 1,
  });
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch("/api/peggle/scores");
      const data = await res.json() as LeaderboardEntry[];
      setLeaderboard(data);
    } catch { /* silent */ }
    finally { setLbLoading(false); }
  }, []);

  const submitScore = useCallback(async (score: number, won: boolean) => {
    if (!user || scoreSubmitted) return;
    setScoreSubmitted(true);
    try {
      await fetch("/api/peggle/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, won }),
      });
    } catch { /* silent */ }
  }, [user, scoreSubmitted]);

  useMusic();

  const { handleClick, resetGame, nextLevel } = useGameLoop({
    canvasRef,
    mouseRef,
    onUiSync: setUi,
    onOrangeTotalChange: (total) => setUi(u => ({ ...u, orangeTotal: total })),
    onBestScore: setBestScore,
    onScoreSubmit: submitScore,
  });

  const handleNextLevel = useCallback(() => {
    setScoreSubmitted(false);
    nextLevel();
  }, [nextLevel]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    };
  }, []);

  const handleTabLeaderboard = useCallback(() => {
    resetGame(false);
    setTab("leaderboard");
    fetchLeaderboard();
  }, [resetGame, fetchLeaderboard]);

  const handleSwitchTab = useCallback((t: "game" | "leaderboard") => {
    setTab(t);
    if (t === "leaderboard") fetchLeaderboard();
  }, [fetchLeaderboard]);

  const displayName = user ? (user.name || user.email || "Joueur") : null;
  const userId = user ? (user as { id?: string }).id : undefined;

  return (
    <div className="flex flex-col h-full select-none" style={{ background: "var(--t-bg)", fontFamily: "var(--t-font-display)" }}>

      {/* Tab bar */}
      <div className="flex border-b-2" style={{ borderColor: "var(--t-border-dark)", background: "var(--t-bg)" }}>
        {(["game", "leaderboard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleSwitchTab(t)}
            style={{
              padding: "4px 14px",
              fontSize: "var(--t-text-xs)",
              fontFamily: "var(--t-font-display)",
              cursor: "pointer",
              background: tab === t
                ? "linear-gradient(to bottom, var(--t-titlebar-from), var(--t-titlebar-to))"
                : "var(--t-app-bg)",
              color: tab === t ? "var(--t-text)" : "var(--t-text-muted)",
              borderWidth: 2,
              borderStyle: "solid",
              borderTopColor: tab === t ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderLeftColor: tab === t ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderBottomColor: tab === t ? "var(--t-bg)" : "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              marginBottom: tab === t ? -2 : 0,
              position: "relative",
              zIndex: tab === t ? 1 : 0,
            }}
          >
            {t === "game" ? "🎯 Jeu" : "🏆 Classement"}
          </button>
        ))}
      </div>

      {/* Game tab */}
      <div style={{ display: tab === "game" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <GameHud ui={ui} bestScore={bestScore} displayName={displayName} />
        <GameCanvas
          canvasRef={canvasRef}
          ui={ui}
          bestScore={bestScore}
          user={user}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onReplay={() => { resetGame(false); setScoreSubmitted(false); }}
          onNextLevel={handleNextLevel}
          onLeaderboard={handleTabLeaderboard}
        />
        <div
          style={{
            textAlign: "center",
            padding: "3px 0",
            borderTop: "2px solid var(--t-border-dark)",
            color: "var(--t-text-muted)",
            fontSize: "var(--t-text-xs)",
          }}
        >
          {ui.phase === "aim"
            ? "Cliquez pour tirer • Détruisez tous les pegs orange"
            : ui.phase === "firing"
            ? "En vol..."
            : ""}
        </div>
      </div>

      {/* Leaderboard tab */}
      <div style={{ display: tab === "leaderboard" ? "flex" : "none", flex: 1, overflow: "hidden" }}>
        <Leaderboard
          entries={leaderboard}
          loading={lbLoading}
          currentUserId={userId}
          onRefresh={fetchLeaderboard}
          showLoginHint={!user}
        />
      </div>
    </div>
  );
}
