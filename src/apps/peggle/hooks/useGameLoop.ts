"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { drawFrame } from "../renderer";
import { tick } from "../engine/state/tick";
import { makeInitialState } from "../engine/state/init";
import { isBossLevel } from "../engine/roguelite";
import { W, H, LAUNCHER_X, LAUNCHER_Y, LAUNCH_SPEED, BONUS_BUCKET_MULTS } from "../engine/constants";
import type { GameState, UiState } from "../engine/types";
import type { RunState } from "../engine/roguelite";
import type { GameEvent } from "../engine/events";

interface UseGameLoopOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  mouseRef: RefObject<{ x: number; y: number }>;
  runStateRef: RefObject<RunState>;
  onUiSync: (ui: UiState) => void;
  onOrangeTotalChange: (total: number) => void;
  onBestScore: (score: number) => void;
  onScoreSubmit: (score: number, won: boolean) => void;
  onLevelWon: (bossKilled: boolean) => void;
  onIronWillUsed: () => void;
}

function clampAngle(angle: number): number {
  return Math.max(0.15, Math.min(Math.PI - 0.15, angle));
}

export function useGameLoop({
  canvasRef,
  mouseRef,
  runStateRef,
  onUiSync,
  onOrangeTotalChange,
  onBestScore,
  onScoreSubmit,
  onLevelWon,
  onIronWillUsed,
}: UseGameLoopOptions) {
  const stateRef = useRef<GameState>(makeInitialState(1, runStateRef.current, false, 0));
  const animRef = useRef<number>(0);
  const orangeTotalRef = useRef(0);

  // Stable refs for callbacks to avoid stale closures
  const onScoreSubmitRef = useRef(onScoreSubmit);
  onScoreSubmitRef.current = onScoreSubmit;
  const onLevelWonRef = useRef(onLevelWon);
  onLevelWonRef.current = onLevelWon;
  const onIronWillUsedRef = useRef(onIronWillUsed);
  onIronWillUsedRef.current = onIronWillUsed;

  const { playPop, playBip, playVictory, playDelete } = useSoundContext();

  const handleEvent = useCallback((ev: GameEvent) => {
    switch (ev.kind) {
      case "sound":
        if (ev.id === "pop") playPop();
        else if (ev.id === "bip") playBip();
        else if (ev.id === "victory") playVictory();
        else if (ev.id === "delete") playDelete();
        break;
      case "level-won":
        onLevelWonRef.current(ev.bossKilled);
        break;
      case "level-lost":
        onScoreSubmitRef.current(ev.score, false);
        break;
      case "iron-will":
        onIronWillUsedRef.current();
        break;
      case "best-score":
        onBestScore(ev.score);
        break;
      case "score-submit":
        onScoreSubmitRef.current(ev.score, ev.won);
        break;
    }
  }, [playPop, playBip, playVictory, playDelete, onBestScore]);

  const syncUI = useCallback(() => {
    const s = stateRef.current;
    const orangeLeft = s.pegs.filter(p => p.orange && !p.hit).length;
    onUiSync({
      balls: s.balls,
      score: s.score,
      orangeLeft,
      orangeTotal: orangeTotalRef.current,
      phase: s.phase,
      message: s.message,
      combo: s.combo,
      level: s.level,
      multiballReady: s.multiballReady,
      multiballPending: s.multiballPending,
      multiballUsed: s.multiballUsed,
      relics: s.runRelics,
      spookyActive: s.spookyActive,
      magnetFrames: s.magnetFrames,
      bossLevel: isBossLevel(s.level),
      stars: Math.floor(s.score / 10000),
    });
  }, [onUiSync]);

  const resetGame = useCallback((keepLevel = false) => {
    const s = stateRef.current;
    const nextLevel = keepLevel ? s.level : 1;
    const newState = makeInitialState(nextLevel, runStateRef.current, keepLevel, s.score);
    orangeTotalRef.current = newState.pegs.filter(p => p.orange).length;
    onOrangeTotalChange(orangeTotalRef.current);
    stateRef.current = newState;
    syncUI();
  }, [syncUI, onOrangeTotalChange, runStateRef]);

  const nextLevel = useCallback(() => {
    stateRef.current.level += 1;
    resetGame(true);
  }, [resetGame]);

  const activateMultiball = useCallback(() => {
    const s = stateRef.current;
    if (s.phase === "aim" && s.multiballReady && !s.multiballPending) {
      s.multiballPending = true;
      s.multiballReady = false;
      syncUI();
    }
  }, [syncUI]);

  function getAngle() {
    const dx = mouseRef.current.x - LAUNCHER_X;
    const dy = mouseRef.current.y - LAUNCHER_Y;
    return clampAngle(Math.atan2(dy, dx));
  }

  const fireBallAtClientPos = useCallback((rect: DOMRect, clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (s.phase !== "aim" || s.ball) return;

    const mx = (clientX - rect.left) * (W / rect.width);
    const my = (clientY - rect.top) * (H / rect.height);
    const angle = clampAngle(Math.atan2(my - LAUNCHER_Y, mx - LAUNCHER_X));

    if (s.multiballPending) {
      const a1 = angle - 0.13, a2 = angle, a3 = angle + 0.13;
      s.ball = { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(a1) * LAUNCH_SPEED, vy: Math.sin(a1) * LAUNCH_SPEED, active: true, trail: [], tint: "#ff8888" };
      s.extraBalls = [
        { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(a2) * LAUNCH_SPEED, vy: Math.sin(a2) * LAUNCH_SPEED, active: true, trail: [], tint: "#ffdd88" },
        { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(a3) * LAUNCH_SPEED, vy: Math.sin(a3) * LAUNCH_SPEED, active: true, trail: [], tint: "#88ffcc" },
      ];
      s.multiballPending = false;
      s.multiballUsed = true;
      s.floatingTexts.push({ x: W / 2, y: LAUNCHER_Y + 40, text: "⚡ MULTIBALL!", life: 1, maxLife: 2, color: "#ffcc44", combo: true, fontSize: 16 });
    } else {
      s.ball = { x: LAUNCHER_X, y: LAUNCHER_Y, vx: Math.cos(angle) * LAUNCH_SPEED, vy: Math.sin(angle) * LAUNCH_SPEED, active: true, trail: [] };
    }

    s.ghostBallActive = s.runUpgrades.includes("ghost_ball");
    s.cursedLuckHits = 0;
    s.balls -= 1;
    s.turnScoreStart = s.score;

    if (s.balls === 0) {
      const mults = [...BONUS_BUCKET_MULTS];
      for (let i = mults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mults[i], mults[j]] = [mults[j]!, mults[i]!];
      }
      s.bonusBucketMults = mults;
      s.bonusBucketFlash = [0, 0, 0];
    }
    s.phase = "firing";
    syncUI();
  }, [syncUI]);

  const handleClick = useCallback((e: { currentTarget: { getBoundingClientRect(): DOMRect }; clientX: number; clientY: number }) => {
    fireBallAtClientPos(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY);
  }, [fireBallAtClientPos]);

  // Touch support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateAimFromTouch = (t: Touch) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (t.clientX - rect.left) * (W / rect.width),
        y: (t.clientY - rect.top) * (H / rect.height),
      };
    };

    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; if (t) updateAimFromTouch(t); };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); const t = e.touches[0]; if (t) updateAimFromTouch(t); };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (!t) return;
      updateAimFromTouch(t);
      fireBallAtClientPos(canvas.getBoundingClientRect(), t.clientX, t.clientY);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [fireBallAtClientPos, mouseRef, canvasRef]);

  // Initial UI sync
  useEffect(() => {
    orangeTotalRef.current = stateRef.current.pegs.filter(p => p.orange).length;
    onOrangeTotalChange(orangeTotalRef.current);
    syncUI();
  }, [syncUI, onOrangeTotalChange]);

  // rAF game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function frame() {
      const s = stateRef.current;
      const ironWillUsed = runStateRef.current.ironWillUsed;

      const { events, syncUI: shouldSync } = tick(s, ironWillUsed);

      for (const ev of events) handleEvent(ev);
      if (shouldSync) syncUI();

      drawFrame(ctx, stateRef.current, getAngle());
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleEvent, syncUI]);

  return { stateRef, handleClick, resetGame, nextLevel, activateMultiball };
}
