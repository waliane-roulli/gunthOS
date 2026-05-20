"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameList } from "./game-list";
import { OptionsPanel } from "./options-panel";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroInput } from "@/components/ui/retro-input";
import { useGameList } from "@/lib/hooks/use-game-list";
import { useDrawing } from "@/lib/hooks/use-drawing";
import { useSound } from "@/lib/hooks/use-sound";
import { useCelebration } from "@/lib/hooks/use-celebration";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useVisitorCount } from "@/lib/hooks/use-visitor-count";
import { useDraggable } from "@/lib/hooks/use-draggable";
import { DEFAULT_OPTIONS } from "@/types/plouf-plouf";
import type { CelebrationOptions } from "@/types/plouf-plouf";

export function PloufApp({ embedded = false }: { embedded?: boolean } = {}) {
  const [inputValue, setInputValue] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [options, setOptions] = useLocalStorage<CelebrationOptions>(
    "ploufPloufOptions",
    DEFAULT_OPTIONS
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const marqueeTopRef = useRef<HTMLDivElement>(null);
  const marqueeBottomRef = useRef<HTMLDivElement>(null);
  const winnerBigRef = useRef<HTMLDivElement>(null);
  const winnerSubRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drag = useDraggable();

  const visitorCount = useVisitorCount();
  const { games, inputError, addGame, removeGame, clearGames } = useGameList();
  const sound = useSound(muted);
  const { canvasRef, start: startCelebration, stop: stopCelebration } = useCelebration();

  const handleVictory = useCallback(() => {}, []);
  const drawing = useDrawing(games.length, sound.playBip, handleVictory);

  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const spawnDamageNumbers = useCallback((o: CelebrationOptions) => {
    const texts = ["+999", "CRIT!", "+XP", "!!1!", "9999", "WIN", "x10", "+500", "GG", "1UP"];
    const count = Math.min(15, Math.floor(o.density / 15));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement("div");
        el.style.cssText = `
          position:fixed; font-family:'VT323',monospace; font-weight:700;
          font-size:2.5rem; z-index:9996; pointer-events:none;
          color:#ffff00; text-shadow:3px 3px 0 #000,-2px -2px 0 #000,0 0 20px #ff00ff;
          animation:damageFloat 1.2s ease-out forwards; letter-spacing:2px;
          left:${Math.random() * 80 + 10}%; top:${Math.random() * 60 + 20}%;
        `;
        el.textContent = texts[Math.floor(Math.random() * texts.length)] ?? "+999";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1200);
      }, i * 100);
    }
  }, []);

  const triggerCelebration = useCallback(
    (name: string, o: CelebrationOptions) => {
      if (o.flash && flashRef.current) {
        flashRef.current.classList.remove("animate-[flashAnim_0.4s_ease-out]");
        void flashRef.current.offsetWidth;
        flashRef.current.classList.add("animate-[flashAnim_0.4s_ease-out]");
      }

      if (o.shake > 0 && containerRef.current) {
        containerRef.current.classList.add("animate-[shake_0.08s_linear_infinite]");
        setTimeout(
          () => containerRef.current?.classList.remove("animate-[shake_0.08s_linear_infinite]"),
          o.duration * 400
        );
      }

      if (o.bigText && winnerBigRef.current) {
        winnerBigRef.current.textContent = name;
        winnerBigRef.current.style.display = "block";
        winnerBigRef.current.style.animation = "none";
        void winnerBigRef.current.offsetWidth;
        winnerBigRef.current.style.animation = "";
        winnerBigRef.current.classList.add("active");

        if (o.text && winnerSubRef.current) {
          winnerSubRef.current.textContent = `★ ${o.text} ★`;
          winnerSubRef.current.style.display = "block";
          winnerSubRef.current.classList.add("active");
        }

        setTimeout(() => {
          winnerBigRef.current?.classList.remove("active");
          if (winnerSubRef.current) {
            winnerSubRef.current.classList.remove("active");
            winnerSubRef.current.style.display = "none";
          }
          if (winnerBigRef.current) winnerBigRef.current.style.display = "none";
        }, Math.min(o.duration * 1000, 4000));
      }

      if (o.marquee) {
        const t = `  ★  ${name}  ★  WINNER  ★  ${name}  ★  CHAMPION  ★  ${name}  ★  `.repeat(6);
        if (marqueeTopRef.current) {
          marqueeTopRef.current.querySelector(".inner")!.textContent = t;
          marqueeTopRef.current.style.display = "block";
        }
        if (marqueeBottomRef.current) {
          marqueeBottomRef.current.querySelector(".inner")!.textContent = t;
          marqueeBottomRef.current.style.display = "block";
        }
        setTimeout(() => {
          if (marqueeTopRef.current) marqueeTopRef.current.style.display = "none";
          if (marqueeBottomRef.current) marqueeBottomRef.current.style.display = "none";
        }, o.duration * 1000);
      }

      if (o.bgPulse) {
        document.body.classList.add("animate-[bgPulse_0.4s_ease-in-out_infinite_alternate]");
        setTimeout(
          () => document.body.classList.remove("animate-[bgPulse_0.4s_ease-in-out_infinite_alternate]"),
          o.duration * 1000
        );
      }

      if (o.damageNumbers) spawnDamageNumbers(o);

      sound.playVictory();
      startCelebration(o);
    },
    [sound, startCelebration, spawnDamageNumbers]
  );

  const handleAdd = useCallback(() => {
    sound.init();
    const ok = addGame(inputValue);
    if (ok) {
      setInputValue("");
      setShowResult(false);
      setWinnerName(null);
      drawing.reset();
    } else if (inputError !== "duplicate") {
      sound.playPop();
    }
  }, [sound, addGame, inputValue, inputError, drawing]);

  const handleRemove = useCallback(
    (index: number) => {
      if (drawing.isDrawing) return;
      sound.init();
      sound.playDelete();
      removeGame(index);
      setShowResult(false);
      setWinnerName(null);
      drawing.reset();
    },
    [drawing, sound, removeGame]
  );

  const handleClear = useCallback(() => {
    if (drawing.isDrawing || games.length === 0) return;
    sound.init();
    sound.playDelete();
    clearGames();
    setShowResult(false);
    setWinnerName(null);
    drawing.reset();
  }, [drawing, sound, clearGames, games.length]);

  const handlePlouf = useCallback(async () => {
    if (drawing.isDrawing || games.length < 2) return;
    sound.init();
    setShowResult(false);
    setWinnerName(null);
    stopCelebration();

    const idx = await drawing.draw();
    if (idx < 0) return;

    const name = games[idx] ?? "";
    setWinnerName(name);
    setShowResult(true);
    triggerCelebration(name, options);
  }, [drawing, games, sound, stopCelebration, triggerCelebration, options]);

  const handleRetry = useCallback(async () => {
    if (drawing.isDrawing || games.length < 2) return;
    setShowResult(false);
    setWinnerName(null);
    stopCelebration();
    setTimeout(() => handlePlouf(), 100);
  }, [drawing.isDrawing, games.length, stopCelebration, handlePlouf]);

  const handleRemoveWinner = useCallback(() => {
    if (drawing.winnerIndex < 0 || drawing.isDrawing) return;
    sound.init();
    sound.playDelete();
    removeGame(drawing.winnerIndex);
    drawing.reset();
    setShowResult(false);
    setWinnerName(null);
  }, [drawing, sound, removeGame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        showResult ? handleRetry() : handlePlouf();
      } else if (e.ctrlKey && e.key === "Delete") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "Escape") {
        if (optionsOpen) setOptionsOpen(false);
        else {
          setShowResult(false);
          stopCelebration();
          inputRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showResult, optionsOpen, handlePlouf, handleRetry, handleClear, stopCelebration]);

  const canDraw = games.length >= 2 && !drawing.isDrawing;

  return (
    <>
      {/* Canvas particules */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none z-[9999]"
        style={{ display: "block" }}
      />

      {/* Flash overlay */}
      <div
        ref={flashRef}
        className="fixed inset-0 bg-white opacity-0 pointer-events-none z-[9998] mix-blend-screen"
      />

      {/* Marquee banners */}
      {(["top", "bottom"] as const).map((pos) => (
        <div
          key={pos}
          ref={pos === "top" ? marqueeTopRef : marqueeBottomRef}
          className={`fixed ${pos === "top" ? "top-0" : "bottom-0"} left-0 w-full z-[9997] pointer-events-none hidden overflow-hidden whitespace-nowrap bg-[linear-gradient(90deg,#ff00ff,#00ffff,#ffff00,#ff00ff)] bg-[length:300%_100%] [animation:marqueeRainbow_1.5s_linear_infinite] text-white font-[family-name:var(--font-vt323)] font-bold text-2xl tracking-[3px] py-1.5 border-y-2 border-black`}
          style={{ backgroundSize: "300% 100%" }}
        >
          <span className="inner inline-block pl-[100%] animate-[marqueeScroll_10s_linear_infinite]" />
        </div>
      ))}

      {/* Winner big text */}
      <div
        ref={winnerBigRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-fredoka)] font-bold text-[clamp(2rem,10vw,7rem)] z-[10000] pointer-events-none hidden text-center max-w-[95vw] px-5 leading-none word-break-break-word bg-[linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff00,#00ccff,#8800ff,#ff00ff,#ff0000)] bg-[length:400%_100%] [background-clip:text] [-webkit-background-clip:text] text-transparent [filter:drop-shadow(0_0_20px_#ffff00)_drop-shadow(0_0_40px_#ff00ff)]"
        style={{ WebkitTextFillColor: "transparent" }}
      />

      {/* Winner sub text */}
      <div
        ref={winnerSubRef}
        className="fixed left-1/2 -translate-x-1/2 font-[family-name:var(--font-vt323)] font-bold text-[clamp(1rem,4vw,2.5rem)] z-[10000] pointer-events-none hidden text-center tracking-[4px] text-[#ffff00] [text-shadow:3px_3px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]"
        style={{ top: "calc(50% - clamp(2rem, 10vw, 7rem) * 0.7)" }}
      />

      {/* Main window */}
      <div
        ref={(el) => {
          containerRef.current = el;
          if (!embedded) drag.elementRef.current = el;
        }}
        className={
          embedded
            ? "relative w-full"
            : "border-[3px] max-w-[720px] w-full shadow-[6px_6px_0_rgba(0,0,0,0.35)] relative z-10"
        }
        style={
          embedded
            ? { backgroundColor: "var(--t-bg)" }
            : {
                ...drag.style,
                backgroundColor: "var(--t-bg)",
                borderTopColor: "var(--t-border-light)",
                borderLeftColor: "var(--t-border-light)",
                borderBottomColor: "var(--t-border-dark)",
                borderRightColor: "var(--t-border-dark)",
              }
        }
      >
        {/* Titlebar — standalone mode only */}
        {!embedded && (
          <div
            onMouseDown={drag.onMouseDown}
            className="px-[10px] py-[6px] flex justify-between items-center border-b-2 border-black tracking-wider text-sm cursor-move select-none"
            style={{
              background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
              color: "var(--t-titlebar-text)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            <span>🎮 PloufPlouf.exe — Tirage au sort</span>
            <div className="flex gap-0.5">
              <TitleBtn onClick={() => { sound.init(); setMuted((m) => !m); }}>
                {muted ? "🔇" : "🔊"}
              </TitleBtn>
              <TitleBtn onClick={() => { setOptionsOpen((o) => !o); sound.init(); }}>
                ⚙
              </TitleBtn>
              <TitleBtn>_</TitleBtn>
              <TitleBtn>□</TitleBtn>
              <TitleBtn>✕</TitleBtn>
            </div>
          </div>
        )}

        {/* Mini toolbar — embedded mode only */}
        {embedded && (
          <div
            className="flex items-center justify-end gap-1 px-2 py-1 border-b"
            style={{
              backgroundColor: "var(--t-bg)",
              borderBottomColor: "var(--t-border-dark)",
            }}
          >
            <TitleBtn onClick={() => { sound.init(); setMuted((m) => !m); }}>
              {muted ? "🔇" : "🔊"}
            </TitleBtn>
            <TitleBtn onClick={() => { setOptionsOpen((o) => !o); sound.init(); }}>
              ⚙
            </TitleBtn>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Header */}
          <div
            className="text-center mb-4 p-3.5 border-[2px]"
            style={{
              background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
            }}
          >
            <div className="inline-block animate-[float_4s_ease-in-out_infinite] cursor-pointer hover:scale-110 hover:-rotate-6 transition-none relative">
              <WaterDropSVG />
            </div>
            <h1 className="text-[2.6rem] font-bold font-[family-name:var(--font-fredoka)] tracking-[2px] mt-2.5 bg-[linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff00,#00ccff,#8800ff,#ff00ff,#ff0000)] bg-[length:300%_100%] [background-clip:text] [-webkit-background-clip:text] text-transparent animate-[rainbow_4s_linear_infinite] [filter:drop-shadow(2px_2px_0_rgba(0,0,0,0.2))]">
              PLOUF PLOUF
            </h1>
            <p className="font-[family-name:var(--font-vt323)] text-[#000080] text-[1.2rem] tracking-[2px] mt-1">
              ★ TIRAGE AU SORT DE JEUX VIDEO ★
              <span className="inline-block bg-red-600 text-yellow-300 font-bold text-xs px-1.5 border border-black ml-1.5 animate-[blink_0.8s_step-end_infinite] -rotate-3">
                NEW!
              </span>
            </p>
          </div>

          {/* Marquee */}
          <div
            className="py-1 overflow-hidden whitespace-nowrap border-[2px] text-base tracking-wider mb-3"
            style={{
              backgroundColor: "var(--t-marquee-bg)",
              color: "var(--t-marquee-text)",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
              fontFamily: "var(--t-font-display)",
            }}
          >
            <span className="inline-block pl-[100%] animate-[marqueeScroll_25s_linear_infinite]">
              ★ Bienvenue sur Plouf Plouf !! ★ Ajoutez vos jeux et laissez le
              destin décider ! ★ 100% GRATUIT ★ Sans inscription ★ Fonctionne
              même sur Netscape 4 !!
            </span>
          </div>

          {/* Input */}
          <div className="flex gap-1.5 mb-2.5">
            <RetroInput
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="🎮 Nom du jeu vidéo…"
              maxLength={100}
              disabled={drawing.isDrawing}
              error={inputError}
              aria-label="Nom du jeu vidéo à ajouter"
            />
            <RetroButton
              variant="primary"
              onClick={handleAdd}
              disabled={drawing.isDrawing}
            >
              + Ajouter
            </RetroButton>
          </div>

          {inputError === "duplicate" && (
            <p className="text-red-600 text-base font-[family-name:var(--font-vt323)] tracking-wider bg-yellow-300 border border-dashed border-red-600 px-2 py-1 mb-2">
              ⚠ ERREUR : Ce jeu est déjà dans la liste !!
            </p>
          )}

          {/* Status bar */}
          <div
            className="flex items-center justify-between mb-2.5 border-[2px] px-2.5 py-1.5 gap-2 flex-wrap"
            style={{
              backgroundColor: "var(--t-bg)",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
            }}
          >
            <span
              className={`px-2.5 py-0.5 text-base tracking-wider border border-black ${games.length === 1 ? "animate-[blink_1s_step-end_infinite]" : ""}`}
              style={{
                backgroundColor: games.length === 1 ? "#f97316" : "var(--t-accent)",
                color: "var(--t-titlebar-text)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              {games.length} {games.length <= 1 ? "jeu" : "jeux"}
            </span>
            <span
              className="text-base tracking-wider"
              style={{
                color: "var(--t-text-muted)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              {games.length === 0
                ? "[ Pret a demarrer ]"
                : games.length === 1
                  ? "[ Ajoutez encore des jeux... ]"
                  : "[ Pret pour le tirage ! ]"}
            </span>
          </div>

          {/* Game list */}
          <div
            ref={listContainerRef}
            className="max-h-[380px] overflow-y-auto mb-3.5 border-[2px] p-1 min-h-[80px]"
            style={{
              backgroundColor: "var(--t-card-bg)",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
            }}
          >
            <GameList
              games={games}
              highlightedIndex={drawing.highlightedIndex}
              winnerIndex={drawing.winnerIndex}
              onRemove={handleRemove}
              disabled={drawing.isDrawing}
            />
          </div>

          {/* Drawing indicator */}
          {drawing.isDrawing && (
            <div className="text-center py-2.5 font-[family-name:var(--font-vt323)] text-[1.4rem] tracking-[2px] font-bold text-[#000080] bg-[#ffff00] border-[2px] border-dashed border-red-600 mb-2.5 animate-[blink_0.5s_step-end_infinite]">
              ★ TIRAGE EN COURS... ★
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            <button
              onClick={handlePlouf}
              disabled={!canDraw}
              className={`flex-1 min-w-[200px] py-3.5 px-5 font-[family-name:var(--font-fredoka)] text-[1.3rem] font-bold tracking-wider cursor-pointer relative overflow-hidden border-[3px] transition-none
                ${canDraw
                  ? "bg-gradient-to-b from-[#ff8800] via-[#ff0000] to-[#cc0000] text-[#ffff00] border-t-[#ffaa00] border-l-[#ffaa00] border-b-[#880000] border-r-[#880000] [text-shadow:2px_2px_0_#000,-1px_-1px_0_#000] hover:from-[#ffaa00] hover:via-[#ff2200] hover:to-[#dd0000] hover:shadow-[0_0_20px_rgba(255,100,0,0.7)] active:border-t-[#880000] active:border-l-[#880000]"
                  : "bg-gradient-to-b from-[#aaaaaa] to-[#888888] text-[#cccccc] border-[#999] cursor-not-allowed [text-shadow:1px_1px_0_#555]"
                }`}
              aria-label="Lancer le tirage au sort"
            >
              {canDraw && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xl animate-[flameFlicker_0.3s_ease-in-out_infinite_alternate]">
                  🔥
                </span>
              )}
              PLOUF PLOUF !
              {canDraw && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xl animate-[flameFlicker_0.3s_ease-in-out_infinite_alternate] [animation-delay:-0.15s]">
                  🔥
                </span>
              )}
            </button>
            <RetroButton
              onClick={handleClear}
              disabled={games.length === 0 || drawing.isDrawing}
            >
              🗑 Vider
            </RetroButton>
          </div>

          {/* Result */}
          {showResult && winnerName && (
            <div
              className={`text-center p-4 border-[3px] border-t-[#808080] border-l-[#808080] border-b-white border-r-white mb-3.5 animate-[fadeIn_0.4s_ease]
                ${options.epicResult
                  ? "bg-[linear-gradient(135deg,#ff00ff,#00ffff,#ffff00,#ff00ff)] bg-[length:400%_400%] [animation:epicBg_2s_ease_infinite,fadeIn_0.4s_ease] border-black shadow-[0_0_30px_rgba(255,0,255,0.6),inset_0_0_0_3px_#ffff00]"
                  : "bg-[#c0c0c0]"
                }`}
            >
              <p
                className={`text-sm font-bold uppercase tracking-[2px] mb-1.5 font-[family-name:var(--font-vt323)] text-xl ${options.epicResult ? "text-black [text-shadow:1px_1px_0_#fff]" : "text-[#000080]"}`}
              >
                ★ RESULTAT ★
              </p>
              <p
                className={`font-[family-name:var(--font-fredoka)] font-bold mb-3 break-words animate-[pop_0.5s_ease]
                  ${options.epicResult
                    ? "text-[2.2rem] bg-[linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff00,#00ccff,#8800ff,#ff00ff,#ff0000)] bg-[length:400%_100%] [background-clip:text] [-webkit-background-clip:text] text-transparent animate-[pop_0.5s_ease,rainbow_2s_linear_infinite] [filter:drop-shadow(2px_2px_0_#000)_drop-shadow(-1px_-1px_0_#000)]"
                    : "text-[1.8rem] text-[#000080]"
                  }`}
                style={options.epicResult ? { WebkitTextFillColor: "transparent" } : undefined}
              >
                🎮 {winnerName}
              </p>
              <div className="flex gap-1.5 justify-center flex-wrap">
                <RetroButton variant="primary" onClick={handleRetry}>
                  ↻ Relancer
                </RetroButton>
                <RetroButton onClick={handleRemoveWinner}>
                  ✕ Retirer
                </RetroButton>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            className="text-center py-2.5 px-2 border-[2px] text-[0.95rem] tracking-wider"
            style={{
              backgroundColor: "var(--t-bg)",
              color: "var(--t-text-muted)",
              fontFamily: "var(--t-font-display)",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
            }}
          >
            Plouf Plouf — outil culte du web, réinventé avec{" "}
            <span className="text-red-600 inline-block animate-[heartBeat_1s_ease-in-out_infinite]">
              ♥
            </span>
            <div className="flex justify-center items-center gap-3 mt-2 pt-2 border-t border-dashed border-[#808080] text-[0.85rem]">
              <a className="text-[#000080] underline cursor-pointer font-bold hover:text-[#ff00ff]">
                &lt;&lt; Précédent
              </a>
              <span>🌐 PLOUF WEBRING 🌐</span>
              <a className="text-[#000080] underline cursor-pointer font-bold hover:text-[#ff00ff]">
                Suivant &gt;&gt;
              </a>
            </div>
            <div className="mt-1.5">
              Vous êtes le visiteur n°{" "}
              <span className="bg-black text-[#00ff00] px-2 py-0.5 border border-inset border-[#808080] font-[family-name:var(--font-vt323)] tracking-[2px]">
                {visitorCount}
              </span>
            </div>
            <div className="mt-1.5 bg-black text-[#00ff00] border border-[#00ff00] px-2 py-0.5 inline-block animate-[blink_1.5s_step-end_infinite]">
              ★ Best viewed in Netscape Navigator 4.0 ★
            </div>
          </div>
        </div>
      </div>

      <OptionsPanel
        open={optionsOpen}
        options={options}
        onChange={setOptions}
        onClose={() => setOptionsOpen(false)}
      />
    </>
  );
}

function TitleBtn({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="border-[2px] w-[22px] h-[22px] flex items-center justify-center text-xs font-bold cursor-pointer select-none"
      style={{
        backgroundColor: "var(--t-bg)",
        color: "var(--t-text)",
        fontFamily: "var(--t-font-display)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
      }}
    >
      {children}
    </button>
  );
}

function WaterDropSVG() {
  return (
    <svg
      width="60"
      height="80"
      viewBox="0 0 60 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="dropGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="100%" stopColor="#2e86c1" />
        </radialGradient>
      </defs>
      <path
        d="M30 5 C30 5 5 40 5 55 C5 70 16 78 30 78 C44 78 55 70 55 55 C55 40 30 5 30 5Z"
        fill="url(#dropGrad)"
      />
      <ellipse cx="22" cy="35" rx="6" ry="10" fill="rgba(255,255,255,0.35)" />
      <ellipse cx="22" cy="52" rx="5" ry="5.5" fill="white" />
      <ellipse cx="38" cy="52" rx="5" ry="5.5" fill="white" />
      <ellipse cx="23" cy="53" rx="2.5" ry="3" fill="#1a2a3a" />
      <ellipse cx="39" cy="53" rx="2.5" ry="3" fill="#1a2a3a" />
      <ellipse cx="22" cy="51.5" rx="1" ry="1.2" fill="white" />
      <ellipse cx="38" cy="51.5" rx="1" ry="1.2" fill="white" />
      <path
        d="M25 63 Q30 68 35 63"
        stroke="#1a5276"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="16" cy="60" rx="4" ry="2.5" fill="rgba(255,150,180,0.4)" />
      <ellipse cx="44" cy="60" rx="4" ry="2.5" fill="rgba(255,150,180,0.4)" />
    </svg>
  );
}
