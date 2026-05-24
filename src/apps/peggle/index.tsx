"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import type { AppProps } from "@/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { PEGGLE_TIPS } from "@/lib/gunth-jokes";
import { pickRandom } from "@/lib/utils/random";
import { useMusic } from "./useMusic";
import { useGameLoop } from "./useGameLoop";
import { GameHud } from "./components/GameHud";
import { GameCanvas } from "./components/GameCanvas";
import { Leaderboard } from "./components/Leaderboard";
import { MainMenu } from "./components/MainMenu";
import { W, H } from "./constants";
import type { UiState, LeaderboardEntry } from "./types";

type Screen = "menu" | "game" | "leaderboard";

export function PeggleApp({ windowId: _windowId }: AppProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: W / 2, y: 0 });

  const [screen, setScreen] = useState<Screen>("menu");
  const [ui, setUi] = useState<UiState>({
    balls: 10, score: 0, orangeLeft: 0, orangeTotal: 0,
    phase: "aim", message: "", combo: 0, level: 1,
    multiballReady: true, multiballPending: false, multiballUsed: false,
  });
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("peggle98_best") ?? "0", 10);
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [tip, setTip] = useState(() => pickRandom(PEGGLE_TIPS));

  useEffect(() => {
    if (ui.phase === "aim") setTip(pickRandom(PEGGLE_TIPS));
  }, [ui.phase]);

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

  const handleUiSync = useCallback((uiState: UiState) => setUi(uiState), []);
  const handleOrangeTotalChange = useCallback((total: number) => setUi(u => ({ ...u, orangeTotal: total })), []);

  const { handleClick, resetGame, nextLevel, activateMultiball } = useGameLoop({
    canvasRef,
    mouseRef,
    onUiSync: handleUiSync,
    onOrangeTotalChange: handleOrangeTotalChange,
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

  const handlePlay = useCallback(() => {
    resetGame(false);
    setScoreSubmitted(false);
    setScreen("game");
  }, [resetGame]);

  const handleGoToMenu = useCallback(() => {
    setScreen("menu");
  }, []);

  const handleGoToLeaderboard = useCallback(() => {
    setScreen("leaderboard");
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const displayName = user ? (user.name || user.email || "Joueur") : null;
  const userId = user?.id;

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: "var(--t-bg)", fontFamily: "var(--t-font-display)" }}
    >
      {/* Main menu */}
      {screen === "menu" && (
        <MainMenu
          bestScore={bestScore}
          displayName={displayName}
          onPlay={handlePlay}
          onLeaderboard={handleGoToLeaderboard}
        />
      )}

      {/* Leaderboard screen */}
      {screen === "leaderboard" && (
        <Leaderboard
          entries={leaderboard}
          loading={lbLoading}
          currentUserId={userId}
          onRefresh={fetchLeaderboard}
          showLoginHint={!user}
          onBack={handleGoToMenu}
        />
      )}

      {/* Game screen — canvas stays mounted to keep the game loop alive */}
      <div
        style={{
          display: screen === "game" ? "flex" : "none",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <GameHud
          ui={ui}
          bestScore={bestScore}
          displayName={displayName}
          onActivateMultiball={activateMultiball}
          onMenu={handleGoToMenu}
        />
        <GameCanvas
          canvasRef={canvasRef}
          ui={ui}
          bestScore={bestScore}
          user={user}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onReplay={() => { resetGame(false); setScoreSubmitted(false); }}
          onNextLevel={handleNextLevel}
          onLeaderboard={handleGoToLeaderboard}
          onMenu={handleGoToMenu}
        />

        {/* Win98 status bar */}
        <div
          style={{
            display: "flex",
            gap: 3,
            padding: "2px 4px",
            borderTop: "2px solid var(--t-border-dark)",
            background: "var(--t-bg)",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "1px 8px",
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
              borderWidth: 1,
              borderStyle: "solid",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ui.phase === "aim" ? tip : ui.phase === "firing" ? "En vol..." : " "}
          </div>
          <div
            style={{
              padding: "1px 8px",
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
              borderWidth: 1,
              borderStyle: "solid",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
              whiteSpace: "nowrap",
              minWidth: 72,
              textAlign: "center",
            }}
          >
            {ui.phase === "aim"
              ? "En attente"
              : ui.phase === "firing"
                ? "En vol"
                : ui.phase === "won"
                  ? "Victoire !"
                  : ui.phase === "lost"
                    ? "Game Over"
                    : " "}
          </div>
        </div>
      </div>
    </div>
  );
}
