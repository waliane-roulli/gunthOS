"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ItemList } from "./item-list";
import { OptionsPanel } from "./options-panel";
import { RouletteWheel, HorizontalPicker } from "./draw-modes";
import { RetroButton } from "@/components/ui/retro-button";
import { RetroTitlebarBtn } from "@/components/ui/retro-titlebar-btn";
import { RetroInput } from "@/components/ui/retro-input";
import { useItemList } from "@/lib/hooks/use-item-list";
import { useDrawing } from "@/lib/hooks/use-drawing";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useCelebration } from "@/lib/hooks/use-celebration";
import { useCelebrationEffects } from "@/lib/hooks/use-celebration-effects";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useVisitorCount } from "@/lib/hooks/use-visitor-count";
import { useDraggable } from "@/lib/hooks/use-draggable";
import { DEFAULT_OPTIONS, PRESETS } from "@/types/plouf-plouf";
import type { CelebrationOptions, DrawMode, PresetName, CelebType } from "@/types/plouf-plouf";

const VALID_TYPES: Set<string> = new Set([
  "confetti", "fireworks", "rain", "matrix", "hearts", "stars",
  "xp", "bubbles", "poop", "money", "alien", "flame", "trophy",
  "trophy-gold", "trophy-silver", "trophy-bronze",
] satisfies CelebType[]);

function sanitizeOptions(raw: CelebrationOptions): CelebrationOptions {
  if (!VALID_TYPES.has(raw.type)) {
    return { ...raw, type: DEFAULT_OPTIONS.type, preset: "custom" };
  }
  return raw;
}

const WATER_DROP = <WaterDropSVG />;

export function PloufApp({ embedded = false }: { embedded?: boolean } = {}) {
  const [inputValue, setInputValue] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [rawOptions, setRawOptions] = useLocalStorage<CelebrationOptions>(
    "ploufPloufOptions",
    DEFAULT_OPTIONS
  );
  const options = sanitizeOptions(rawOptions);
  const setOptions = useCallback(
    (value: CelebrationOptions | ((prev: CelebrationOptions) => CelebrationOptions)) => {
      setRawOptions(value instanceof Function ? value(options) : value);
    },
    [setRawOptions, options]
  );
  const [drawMode, setDrawMode] = useLocalStorage<DrawMode>(
    "ploufPloufDrawMode",
    "vertical"
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const marqueeTopRef = useRef<HTMLDivElement>(null);
  const marqueeBottomRef = useRef<HTMLDivElement>(null);
  const winnerBigRef = useRef<HTMLDivElement>(null);
  const winnerSubRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drag = useDraggable();

  const visitorCount = useVisitorCount();
  const { games, inputError, addGame, removeGame, clearGames, importGames } = useItemList();
  const sound = useSoundContext();
  const { canvasRef, start: startCelebration, stop: stopCelebration } = useCelebration();

  const playBip = useCallback(() => { if (!sfxMuted) sound.playBip(); }, [sfxMuted, sound]);
  const drawing = useDrawing(games.length, playBip, undefined);

  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activeOpts, setActiveOpts] = useState<CelebrationOptions>(options);

  // Stoppe la musique au démontage (fermeture de fenêtre).
  useEffect(() => {
    return () => { sound.stopPloufPlouf(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Démarre / stoppe la musique selon le mute, avec cleanup garanti au démontage.
  useEffect(() => {
    if (musicMuted) {
      sound.stopPloufPlouf();
    } else {
      sound.setOnFirstInit(() => { sound.startPloufPlouf(); });
      sound.startPloufPlouf();
    }
    return () => { sound.stopPloufPlouf(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicMuted]);

  const soundForCelebration = { ...sound, playVictory: () => { if (!sfxMuted) sound.playVictory(); } };

  const { trigger: triggerCelebration } = useCelebrationEffects({
    flashRef,
    containerRef,
    winnerBigRef,
    winnerSubRef,
    marqueeTopRef,
    marqueeBottomRef,
    sound: soundForCelebration,
    startCelebration,
  });

  const handleAdd = useCallback(() => {
    sound.init();
    const ok = addGame(inputValue);
    if (ok) {
      setInputValue("");
      setShowResult(false);
      setWinnerName(null);
      drawing.reset();
    } else if (inputError !== "duplicate") {
      if (!sfxMuted) sound.playPop();
    }
  }, [sound, sfxMuted, addGame, inputValue, inputError, drawing]);

  const handleRemove = useCallback(
    (index: number) => {
      if (drawing.isDrawing) return;
      sound.init();
      if (!sfxMuted) sound.playDelete();
      removeGame(index);
      setShowResult(false);
      setWinnerName(null);
      drawing.reset();
    },
    [drawing, sound, sfxMuted, removeGame]
  );

  const handleClear = useCallback(() => {
    if (drawing.isDrawing || games.length === 0) return;
    sound.init();
    if (!sfxMuted) sound.playDelete();
    clearGames();
    setShowResult(false);
    setWinnerName(null);
    drawing.reset();
  }, [drawing, sound, sfxMuted, clearGames, games.length]);

  const handlePlouf = useCallback(async () => {
    if (drawing.isDrawing || games.length < 2) return;
    sound.init();
    setShowResult(false);
    setWinnerName(null);
    stopCelebration();

    const idx = await drawing.draw(drawMode === "horizontal");
    if (idx < 0) return;

    const name = games[idx] ?? "";
    setWinnerName(name);
    setShowResult(true);
    const ceOpts = options.randomPreset
      ? (() => {
          const names = Object.keys(PRESETS) as PresetName[];
          const randomName = names[Math.floor(Math.random() * names.length)]!;
          return { ...PRESETS[randomName], randomPreset: true };
        })()
      : options;
    setActiveOpts(ceOpts);
    triggerCelebration(name, ceOpts);
  }, [drawing, games, sound, stopCelebration, triggerCelebration, options]);

  const handleRetry = useCallback(async () => {
    if (drawing.isDrawing || games.length < 2) return;
    setShowResult(false);
    setWinnerName(null);
    stopCelebration();
    setTimeout(handlePlouf, 100);
  }, [drawing.isDrawing, games.length, stopCelebration, handlePlouf]);

  const handleRemoveWinner = useCallback(() => {
    if (drawing.winnerIndex < 0 || drawing.isDrawing) return;
    sound.init();
    if (!sfxMuted) sound.playDelete();
    removeGame(drawing.winnerIndex);
    drawing.reset();
    setShowResult(false);
    setWinnerName(null);
  }, [drawing, sound, sfxMuted, removeGame]);

  const handleExport = useCallback(() => {
    if (games.length === 0) return;
    const json = JSON.stringify(games, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ploufplouf-list.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [games]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string);
          if (Array.isArray(data) && data.every((item) => typeof item === "string")) {
            importGames(data);
            setShowResult(false);
            setWinnerName(null);
            drawing.reset();
          }
        } catch {
          // fichier invalide, on ignore
        }
      };
      reader.readAsText(file);
      // reset pour permettre de réimporter le même fichier
      e.target.value = "";
    },
    [importGames, drawing]
  );

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
    {createPortal(
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
        {(["top", "bottom"] as const).map((pos) => {
          const isLnk = activeOpts.preset === "lnk";
          return (
            <div
              key={pos}
              ref={pos === "top" ? marqueeTopRef : marqueeBottomRef}
              className={`fixed ${pos === "top" ? "top-0" : "bottom-0"} left-0 w-full z-[99999] pointer-events-none hidden overflow-hidden whitespace-nowrap text-white font-[family-name:var(--font-vt323)] font-bold text-2xl tracking-[3px] py-1.5 border-y-2 border-black ${
                isLnk
                  ? "bg-[#9146ff]"
                  : "bg-[linear-gradient(90deg,#ff00ff,#00ffff,#ffff00,#ff00ff)] bg-[length:300%_100%] [animation:marqueeRainbow_1.5s_linear_infinite]"
              }`}
              style={isLnk ? undefined : { backgroundSize: "300% 100%" }}
            >
              <span className="inner inline-block pl-[100%] animate-[marqueeScroll_10s_linear_infinite]" />
            </div>
          );
        })}

        {/* Winner big text */}
        <div
          ref={winnerBigRef}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-fredoka)] font-bold text-[clamp(2rem,10vw,7rem)] z-[99999] pointer-events-none hidden text-center max-w-[95vw] px-5 leading-none word-break-break-word"
          style={
            activeOpts.rainbow
              ? {
                  backgroundImage: "linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff00,#00ccff,#8800ff,#ff00ff,#ff0000)",
                  backgroundSize: "400% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 10px #ffff00) drop-shadow(0 0 20px #ff00ff)",
                }
              : {
                  color: activeOpts.winnerColor,
                  WebkitTextFillColor: activeOpts.winnerColor,
                  textShadow: "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000",
                  filter: "none",
                }
          }
        />

        {/* Winner sub text */}
        <div
          ref={winnerSubRef}
          className="fixed left-1/2 -translate-x-1/2 font-[family-name:var(--font-vt323)] font-bold text-[clamp(1rem,4vw,2.5rem)] z-[99999] pointer-events-none hidden text-center tracking-[4px]"
          style={{
            top: "calc(50% - clamp(2rem, 10vw, 7rem) * 0.7)",
            color: activeOpts.rainbow ? "#ffff00" : activeOpts.winnerSubColor,
            textShadow: "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000",
          }}
        />
      </>,
      document.body
    )}


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
              <RetroTitlebarBtn onClick={() => { sound.init(); setSfxMuted((m) => !m); }} title="Couper les effets sonores">
                {sfxMuted ? "🔇" : "🔊"}
              </RetroTitlebarBtn>
              <RetroTitlebarBtn onClick={() => { sound.init(); setMusicMuted((m) => !m); }} title="Couper la musique">
                {musicMuted ? "🎵" : "🎶"}
              </RetroTitlebarBtn>
              <RetroTitlebarBtn onClick={() => { setOptionsOpen((o) => !o); sound.init(); }}>
                ⚙
              </RetroTitlebarBtn>
              <RetroTitlebarBtn>_</RetroTitlebarBtn>
              <RetroTitlebarBtn>□</RetroTitlebarBtn>
              <RetroTitlebarBtn close>✕</RetroTitlebarBtn>
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
            <RetroTitlebarBtn onClick={() => { sound.init(); setSfxMuted((m) => !m); }} title="Couper les effets sonores">
              {sfxMuted ? "🔇" : "🔊"}
            </RetroTitlebarBtn>
            <RetroTitlebarBtn onClick={() => { sound.init(); setMusicMuted((m) => !m); }} title="Couper la musique">
              {musicMuted ? "🎵" : "🎶"}
            </RetroTitlebarBtn>
            <RetroTitlebarBtn onClick={() => { setOptionsOpen((o) => !o); sound.init(); }}>
              ⚙
            </RetroTitlebarBtn>
          </div>
        )}

        <div className="p-3 sm:p-4">
          {/* Header */}
          <div
            className="flex items-center justify-center gap-3 mb-2 p-2 border-[2px]"
            style={{
              background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
            }}
          >
            <div className="animate-[float_4s_ease-in-out_infinite] cursor-pointer hover:scale-110 hover:-rotate-6 transition-none shrink-0">
              {WATER_DROP}
            </div>
            <div className="text-center">
              <h1 className="text-[1.7rem] font-bold font-[family-name:var(--font-fredoka)] tracking-[2px] leading-tight bg-[linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff00,#00ccff,#8800ff,#ff00ff,#ff0000)] bg-[length:300%_100%] [background-clip:text] [-webkit-background-clip:text] text-transparent animate-[rainbow_4s_linear_infinite] [filter:drop-shadow(2px_2px_0_rgba(0,0,0,0.2))]">
                PLOUF PLOUF
              </h1>
              <p className="font-[family-name:var(--font-vt323)] text-[#000080] text-[0.9rem] tracking-[2px] leading-tight">
                ★ TIRAGE AU SORT ★
                <span className="inline-block bg-red-600 text-yellow-300 font-bold text-[0.65rem] px-1 border border-black ml-1 animate-[blink_0.8s_step-end_infinite] -rotate-3 align-middle">
                  NEW!
                </span>
              </p>
            </div>
          </div>

          {/* Marquee */}
          <div
            className="py-0.5 overflow-hidden whitespace-nowrap border-[2px] text-sm tracking-wider mb-2"
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
              ★ Bienvenue sur Plouf Plouf !! ★ Ajoutez vos éléments et laissez le
              destin décider ! ★ 100% GRATUIT ★ Sans inscription ★ Fonctionne
              même sur Netscape 4 !!
            </span>
          </div>

          {/* Input */}
          <div className="flex gap-1.5 mb-2">
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
              placeholder="✏️ Ajouter un élément (ou plusieurs séparés par des virgules)…"
              maxLength={500}
              disabled={drawing.isDrawing}
              error={inputError}
              aria-label="Élément à ajouter"
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

          {/* Mode selector + Status bar */}
          <div
            className="flex items-center justify-between mb-2 border-[2px] px-2 py-1 gap-1.5 flex-wrap"
            style={{
              backgroundColor: "var(--t-bg)",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
            }}
          >
            <div className="flex items-center gap-0.5">
              {/* Draw mode buttons */}
              {([
                ["roulette", "🎡", "Roue du hasard"],
                ["horizontal", "↔️", "Horizontal"],
                ["vertical", "↕️", "Vertical"],
              ] as const).map(([mode, icon, label]) => (
                <button
                  key={mode}
                  onClick={() => { if (!drawing.isDrawing) setDrawMode(mode); }}
                  disabled={drawing.isDrawing}
                  title={`Mode ${label}`}
                  className="px-1.5 py-0.5 text-xs font-bold tracking-wider border-[2px] transition-none"
                  style={{
                    backgroundColor: drawMode === mode ? "var(--t-accent)" : "var(--t-bg)",
                    color: drawMode === mode ? "var(--t-titlebar-text)" : "var(--t-text-muted)",
                    fontFamily: "var(--t-font-display)",
                    borderTopColor: drawMode === mode ? "var(--t-border-dark)" : "var(--t-border-light)",
                    borderLeftColor: drawMode === mode ? "var(--t-border-dark)" : "var(--t-border-light)",
                    borderBottomColor: drawMode === mode ? "var(--t-border-light)" : "var(--t-border-dark)",
                    borderRightColor: drawMode === mode ? "var(--t-border-light)" : "var(--t-border-dark)",
                    opacity: drawing.isDrawing ? 0.5 : 1,
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 ml-auto">
              <button
                onClick={handleClear}
                disabled={games.length === 0 || drawing.isDrawing}
                title="Vider la liste"
                className="px-1.5 py-0.5 text-xs font-bold tracking-wider border border-black transition-none disabled:opacity-40"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                }}
              >
                🗑
              </button>
              <button
                onClick={handleExport}
                disabled={games.length === 0}
                title="Exporter la liste"
                className="px-1.5 py-0.5 text-xs font-bold tracking-wider border border-black transition-none disabled:opacity-40"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                }}
              >
                📤
              </button>
              <button
                onClick={handleImport}
                disabled={drawing.isDrawing}
                title="Importer une liste"
                className="px-1.5 py-0.5 text-xs font-bold tracking-wider border border-black transition-none disabled:opacity-40"
                style={{
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  fontFamily: "var(--t-font-display)",
                }}
              >
                📥
              </button>
              <span
                className={`px-1.5 py-0 text-xs tracking-wider border border-black ${games.length === 1 ? "animate-[blink_1s_step-end_infinite]" : ""}`}
                style={{
                  backgroundColor: games.length === 1 ? "#f97316" : "var(--t-accent)",
                  color: "var(--t-titlebar-text)",
                  fontFamily: "var(--t-font-display)",
                }}
              >
                {games.length} {games.length <= 1 ? "elem." : "elems."}
              </span>
            </div>
          </div>

          {/* Game list / Draw mode display */}
          <div
            ref={listContainerRef}
            className="mb-2 border-[2px] p-1 min-h-[80px]"
            style={{
              backgroundColor: "var(--t-card-bg)",
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
              maxHeight: drawMode === "roulette" ? "none" : "380px",
              overflowY: drawMode === "roulette" ? "visible" : "auto",
            }}
          >
            {drawMode === "roulette" ? (
              <RouletteWheel
                games={games}
                highlightedIndex={drawing.highlightedIndex}
                winnerIndex={drawing.winnerIndex}
                isDrawing={drawing.isDrawing}
              />
            ) : drawMode === "horizontal" ? (
              <HorizontalPicker
                games={games}
                highlightedIndex={drawing.highlightedIndex}
                winnerIndex={drawing.winnerIndex}
                isDrawing={drawing.isDrawing}
                onRemove={handleRemove}
                disabled={drawing.isDrawing}
              />
            ) : (
              <ItemList
                games={games}
                highlightedIndex={drawing.highlightedIndex}
                winnerIndex={drawing.winnerIndex}
                onRemove={handleRemove}
                disabled={drawing.isDrawing}
              />
            )}
          </div>

          {/* Drawing indicator */}
          {drawing.isDrawing && (
            <div className="text-center py-1 font-[family-name:var(--font-vt323)] text-[1.1rem] tracking-[2px] font-bold text-[#000080] bg-[#ffff00] border-[2px] border-dashed border-red-600 mb-2 animate-[blink_0.5s_step-end_infinite]">
              ★ TIRAGE EN COURS... ★
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5 flex-wrap mb-2.5">
            <button
              onClick={handlePlouf}
              disabled={!canDraw}
              className={`flex-1 min-w-[200px] py-2.5 px-4 font-[family-name:var(--font-fredoka)] text-[1.1rem] font-bold tracking-wider cursor-pointer relative overflow-hidden border-[3px] transition-none
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Result */}
          {showResult && winnerName && (
            <div
              className={`text-center p-3 border-[3px] border-t-[#808080] border-l-[#808080] border-b-white border-r-white mb-2.5 animate-[fadeIn_0.4s_ease]
                ${activeOpts.epicResult
                  ? "bg-[linear-gradient(135deg,#ff00ff,#00ffff,#ffff00,#ff00ff)] bg-[length:400%_400%] [animation:epicBg_2s_ease_infinite,fadeIn_0.4s_ease] border-black shadow-[0_0_30px_rgba(255,0,255,0.6),inset_0_0_0_3px_#ffff00]"
                  : "bg-[#c0c0c0]"
                }`}
            >
              <p
                className={`text-sm font-bold uppercase tracking-[2px] mb-1.5 font-[family-name:var(--font-vt323)] text-xl ${activeOpts.epicResult ? "text-black [text-shadow:1px_1px_0_#fff]" : "text-[#000080]"}`}
              >
                ★ RESULTAT ★
              </p>
              <p
                className={`font-[family-name:var(--font-fredoka)] font-bold mb-3 break-words animate-[pop_0.5s_ease]
                  ${activeOpts.epicResult
                    ? "text-[2.2rem] bg-[linear-gradient(90deg,#ff0000,#ff8800,#ffee00,#00ff00,#00ccff,#8800ff,#ff00ff,#ff0000)] bg-[length:400%_100%] [background-clip:text] [-webkit-background-clip:text] text-transparent animate-[pop_0.5s_ease,rainbow_2s_linear_infinite] [filter:drop-shadow(2px_2px_0_#000)_drop-shadow(-1px_-1px_0_#000)]"
                    : "text-[1.8rem]"
                  }`}
                style={activeOpts.epicResult ? { WebkitTextFillColor: "transparent" } : { color: activeOpts.winnerColor, textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}
              >
                🎉 {winnerName}
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


function WaterDropSVG() {
  return (
    <svg
      width="42"
      height="56"
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
