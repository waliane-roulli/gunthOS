"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import type { AppProps } from "@/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { PEAGLE_TIPS } from "@/lib/gunth-jokes";
import { pickRandom } from "@/lib/utils/random";
import { useMusic } from "./hooks/useMusic";
import { useGameLoop } from "./hooks/useGameLoop";
import { GameHud } from "./components/GameHud";
import { GameCanvas } from "./components/GameCanvas";
import { Leaderboard } from "./components/Leaderboard";
import { MainMenu } from "./components/MainMenu";
import { ClassPicker } from "./components/ClassPicker";
import { UpgradePicker } from "./components/UpgradePicker";
import { W, H } from "./engine/constants";
import type { UiState, LeaderboardEntry, UpgradeId } from "./engine/types";
import type { RunState, ClassId } from "./engine/roguelite";
import { makeInitialRunState, generateUpgradeOffer } from "./engine/roguelite";
import { DevPanel } from "./components/DevPanel";
import type { DevConfig } from "./components/DevPanel";

type Screen = "menu" | "class-pick" | "game" | "leaderboard";

const EMPTY_RUN: RunState = makeInitialRunState("canonnier");

export function PeagleApp({ windowId: _windowId }: AppProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: W / 2, y: 0 });
  const runStateRef = useRef<RunState>(EMPTY_RUN);
  const devConfigRef = useRef<DevConfig | null>(null);
  const [devSessionActive, setDevSessionActive] = useState(false);

  const [screen, setScreen] = useState<Screen>("menu");
  const [ui, setUi] = useState<UiState>({
    balls: 10, score: 0, orangeLeft: 0, orangeTotal: 0,
    phase: "aim", message: "", combo: 0, level: 1,
    multiballReady: true, multiballPending: false, multiballUsed: false,
    relics: [], spookyActive: false, magnetFrames: 0, bossLevel: false, stars: 0,
  });
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("peagle98_best") ?? "0", 10);
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [tip, setTip] = useState(() => pickRandom(PEAGLE_TIPS));

  // Upgrade pick state
  const [upgradeOffer, setUpgradeOffer] = useState<UpgradeId[] | null>(null);
  const [lastBossKilled, setLastBossKilled] = useState(false);
  const [showDevPanelInGame, setShowDevPanelInGame] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    fetch("/api/admin/check")
      .then(r => r.json())
      .then((d: { isAdmin: boolean }) => setIsAdmin(d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ui.phase === "aim") setTip(pickRandom(PEAGLE_TIPS));
  }, [ui.phase]);

  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch("/api/peagle/scores");
      const data = await res.json() as LeaderboardEntry[];
      setLeaderboard(data);
    } catch { /* silent */ }
    finally { setLbLoading(false); }
  }, []);

  const submitScore = useCallback(async (score: number, won: boolean) => {
    if (!user || scoreSubmitted) return;
    setScoreSubmitted(true);
    try {
      await fetch("/api/peagle/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, won }),
      });
    } catch { /* silent */ }
  }, [user, scoreSubmitted]);

  const handleLevelWon = useCallback((bossKilled: boolean) => {
    const offer = generateUpgradeOffer(runStateRef.current.upgrades, bossKilled);
    setLastBossKilled(bossKilled);
    setUpgradeOffer(offer);
  }, []);

  const handleIronWillUsed = useCallback(() => {
    runStateRef.current = { ...runStateRef.current, ironWillUsed: true };
  }, []);

  useMusic();

  const handleUiSync = useCallback((uiState: UiState) => setUi(uiState), []);
  const handleOrangeTotalChange = useCallback((total: number) => setUi(u => ({ ...u, orangeTotal: total })), []);

  const { handleClick, resetGame, nextLevel, activateMultiball, skipLevel } = useGameLoop({
    canvasRef,
    mouseRef,
    runStateRef,
    devConfigRef,
    onUiSync: handleUiSync,
    onOrangeTotalChange: handleOrangeTotalChange,
    onBestScore: setBestScore,
    onScoreSubmit: submitScore,
    onLevelWon: handleLevelWon,
    onIronWillUsed: handleIronWillUsed,
  });

  const handleUpgradePick = useCallback((id: UpgradeId) => {
    runStateRef.current = { ...runStateRef.current, upgrades: [...runStateRef.current.upgrades, id] };
    setUpgradeOffer(null);
    nextLevel();
  }, [nextLevel]);

  const handleUpgradeSkip = useCallback(() => {
    setUpgradeOffer(null);
    nextLevel();
  }, [nextLevel]);

  const handleMouseMove = useCallback((e: { clientX: number; clientY: number; currentTarget: { getBoundingClientRect(): DOMRect } }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    };
  }, []);

  const handleClassPick = useCallback((classId: ClassId) => {
    runStateRef.current = makeInitialRunState(classId);
    resetGame(false);
    setScoreSubmitted(false);
    setUpgradeOffer(null);
    setScreen("game");
  }, [resetGame]);

  const handleDevLaunch = useCallback((cfg: DevConfig) => {
    devConfigRef.current = cfg;
    const base = makeInitialRunState(cfg.classId);
    runStateRef.current = {
      ...base,
      relics: cfg.relics.length > 0 ? cfg.relics : base.relics,
      upgrades: cfg.upgrades,
    };
    resetGame(false, cfg.startLevel);
    setScoreSubmitted(false);
    setUpgradeOffer(null);
    setDevSessionActive(true);
    setScreen("game");
  }, [resetGame]);

  const handlePlay = useCallback(() => {
    setScreen("class-pick");
  }, []);

  const handleGoToMenu = useCallback(() => {
    setUpgradeOffer(null);
    setScreen("menu");
  }, []);

  const handleGoToLeaderboard = useCallback(() => {
    setScreen("leaderboard");
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleReplay = useCallback(() => {
    runStateRef.current = makeInitialRunState(runStateRef.current.classId);
    resetGame(false);
    setScoreSubmitted(false);
    setUpgradeOffer(null);
  }, [resetGame]);

  const displayName = user ? (user.name || user.email || "Joueur") : null;
  const userId = user?.id;

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: "var(--t-bg)", fontFamily: "var(--t-font-display)" }}
    >
      {screen === "menu" && (
        <MainMenu
          bestScore={bestScore}
          displayName={displayName}
          isAdmin={isAdmin}
          onPlay={handlePlay}
          onLeaderboard={handleGoToLeaderboard}
          onDevLaunch={handleDevLaunch}
        />
      )}

      {screen === "class-pick" && (
        <ClassPicker onPick={handleClassPick} />
      )}

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
          isAdmin={isAdmin}
          showDevTools={isAdmin && devSessionActive}
          onActivateMultiball={activateMultiball}
          onSkipLevel={skipLevel}
          onOpenDevPanel={() => setShowDevPanelInGame(true)}
          onMenu={handleGoToMenu}
        />

        {/* DevPanel overlay in-game */}
        {showDevPanelInGame && (
          <DevPanel
            onClose={() => setShowDevPanelInGame(false)}
            onLaunch={(cfg) => {
              devConfigRef.current = cfg;
              const base = makeInitialRunState(cfg.classId);
              runStateRef.current = {
                ...base,
                relics: cfg.relics.length > 0 ? cfg.relics : base.relics,
                upgrades: cfg.upgrades,
              };
              resetGame(false, cfg.startLevel);
              setScoreSubmitted(false);
              setUpgradeOffer(null);
              setDevSessionActive(true);
              setShowDevPanelInGame(false);
            }}
          />
        )}

        {/* Canvas area — upgrade picker overlays here */}
        <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <GameCanvas
            canvasRef={canvasRef}
            ui={ui}
            bestScore={bestScore}
            user={user}
            upgradeOfferPending={!!upgradeOffer}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onReplay={handleReplay}
            onLeaderboard={handleGoToLeaderboard}
            onMenu={handleGoToMenu}
          />

          {/* Upgrade picker overlay — shown after each won level */}
          {upgradeOffer && (
            <UpgradePicker
              offers={upgradeOffer}
              relics={ui.relics}
              level={ui.level}
              score={ui.score}
              bossKilled={lastBossKilled}
              onPick={handleUpgradePick}
              onSkip={handleUpgradeSkip}
            />
          )}
        </div>

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
            {upgradeOffer
              ? "Choisissez une amélioration pour continuer le run..."
              : ui.phase === "aim" ? tip : ui.phase === "firing" ? "En vol..." : " "}
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
            {upgradeOffer
              ? "Upgrade !"
              : ui.phase === "aim" ? "En attente"
              : ui.phase === "firing" ? "En vol"
              : ui.phase === "won" ? "Victoire !"
              : ui.phase === "lost" ? "Game Over"
              : " "}
          </div>
        </div>
      </div>
    </div>
  );
}
