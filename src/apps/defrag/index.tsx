"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { pickRandom } from "@/lib/utils/random";
import { TASKKILL_WIN_EVENT, TASKKILL_LOSE_EVENT, submitDefragResult, type TaskkillResult } from "@/lib/defrag-game-bridge";
import type { AppProps } from "@/types";

const DEFRAG_MESSAGES = [
  "Analyse des clusters perdus...",
  "Réorganisation des fragments inutiles...",
  "Optimisation du registre GunthOS...",
  "Déplacement des données vers le vide...",
  "Compression des fichiers système critiques...",
  "Nettoyage des cookies de 1998...",
  "Défragmentation de la mémoire virtuelle...",
  "Tri alphabétique des pixels...",
  "Suppression des fichiers .tmp (83 Go)...",
  "Sauvegarde dans C:\\GUNTH\\BACKUP\\BACKUP2\\FINAL\\...",
  "Optimisation de l'optimiseur d'optimisation...",
  "Chargement du module de chargement...",
  "Interrogation des secteurs défaillants sur leur intention de se rétablir...",
  "Réparation du module de réparation (erreur dans la réparation)...",
  "Défragmentation terminée à 99%. Arrêt du processus. Relance.",
];

type DefragBlock = "used" | "fragmented" | "free" | "system" | "mystery";

function randomBlock(): DefragBlock {
  return pickRandom<DefragBlock>(["used", "fragmented", "free", "system", "mystery"])!;
}

const BLOCK_VAR: Record<DefragBlock, string> = {
  used: "var(--t-defrag-used)",
  fragmented: "var(--t-defrag-fragmented)",
  free: "var(--t-defrag-free)",
  system: "var(--t-defrag-system)",
  mystery: "var(--t-defrag-mystery)",
};

type DefragPhase = "playing" | "won" | "lost";

export function DefragApp(_: AppProps) {
  const [phase, setPhase] = useState<DefragPhase>("playing");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Défragmentation en cours... Jouez pour purger les menaces !");
  const [blocks, setBlocks] = useState<DefragBlock[]>(() =>
    Array.from({ length: 120 }, randomBlock)
  );
  const [finalScore, setFinalScore] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for game results
  const handleWin = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { score: number };
    setPhase("won");
    setProgress(100);
    setFinalScore(detail.score);
    setMessage("Défragmentation réussie !");
    const result: TaskkillResult = { score: detail.score, won: true, timestamp: new Date().toISOString() };
    submitDefragResult(result);
  }, []);

  const handleLose = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { score: number };
    setPhase("lost");
    setProgress(0);
    setFinalScore(detail.score);
    setMessage("Échec de la défragmentation. Votre disque est plus fragmenté qu'avant.");
    const result: TaskkillResult = { score: detail.score, won: false, timestamp: new Date().toISOString() };
    submitDefragResult(result);
  }, []);

  useEffect(() => {
    window.addEventListener(TASKKILL_WIN_EVENT, handleWin);
    window.addEventListener(TASKKILL_LOSE_EVENT, handleLose);
    return () => {
      window.removeEventListener(TASKKILL_WIN_EVENT, handleWin);
      window.removeEventListener(TASKKILL_LOSE_EVENT, handleLose);
    };
  }, [handleWin, handleLose]);

  // Animate blocks and fake progress while playing
  useEffect(() => {
    if (phase !== "playing") return;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 0.4;
        return next >= 95 ? 95 : next;
      });
      setMessage(pickRandom(DEFRAG_MESSAGES)!);
      setBlocks((b) => b.map((c) => (Math.random() < 0.06 ? randomBlock() : c)));
    }, 200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const isDone = phase === "won" || phase === "lost";

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="text-sm tracking-widest" style={{ color: "var(--t-text-muted)" }}>
        DÉFRAGMENTEUR DE DISQUE GUNTH — Disque C:\ (847 Mo utilisés sur 850 Mo)
      </div>

      {/* Block grid */}
      <div
        className="border-[2px] p-2"
        style={{
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
          backgroundColor: "var(--t-inset-from)",
        }}
      >
        <div className="flex flex-wrap gap-[2px]">
          {blocks.map((block, i) => (
            <div
              key={i}
              className="w-3 h-3 border border-black/20"
              style={{ backgroundColor: BLOCK_VAR[block] }}
            />
          ))}
        </div>
      </div>

      {/* Status message */}
      <div>
        <div className="text-sm tracking-wider mb-1" style={{
          color: phase === "won" ? "var(--t-accent)"
            : phase === "lost" ? "var(--t-defrag-fragmented, #cc2200)"
            : "var(--t-text)"
        }}>
          {phase === "won" && "✅ "}
          {phase === "lost" && "❌ "}
          {message}
        </div>

        {/* Progress bar */}
        <div
          className="h-5 border-[2px] relative overflow-hidden"
          style={{
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            backgroundColor: "var(--t-app-bg)",
          }}
        >
          <div
            className="h-full transition-none"
            style={{
              width: `${progress}%`,
              background: phase === "lost"
                ? "var(--t-defrag-fragmented, #cc2200)"
                : phase === "won"
                  ? "linear-gradient(to right, #008000, #00cc00)"
                  : "linear-gradient(to right, var(--t-progress-from), var(--t-progress-to))",
            }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-bold tracking-widest"
            style={{ color: "var(--t-text)", textShadow: "0 0 3px var(--t-app-bg), 0 0 3px var(--t-app-bg)" }}
          >
            {Math.floor(progress)}%
          </span>
        </div>
      </div>

      {/* Result panel */}
      {isDone && (
        <div
          className="text-center text-sm tracking-wider p-2 border"
          style={{
            color: phase === "won" ? "var(--t-accent)" : "var(--t-defrag-fragmented, #cc2200)",
            borderColor: "var(--t-border-dark)",
            backgroundColor: "var(--t-inset-from)",
          }}
        >
          {phase === "won" ? (
            <>
              ✅ Défragmentation réussie !<br />
              Votre disque est maintenant 0.3% moins fragmenté.<br />
              <span className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                Score : {finalScore.toLocaleString()} pts — Windows Update a été purgé.
              </span>
            </>
          ) : (
            <>
              ❌ Échec de la défragmentation.<br />
              Votre disque est plus fragmenté qu&apos;avant.<br />
              <span className="text-xs" style={{ color: "var(--t-text-muted)" }}>
                Score : {finalScore.toLocaleString()} pts — Windows Update a gagné.
              </span>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 text-xs tracking-wider flex-wrap" style={{ color: "var(--t-text-muted)" }}>
        {(["used", "fragmented", "free", "system", "mystery"] as DefragBlock[]).map((block) => {
          const labels: Record<DefragBlock, string> = {
            used: "Utilisé",
            fragmented: "Fragmenté",
            free: "Libre",
            system: "Système",
            mystery: "Mystérieux",
          };
          return (
            <span key={block} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 border border-black/20" style={{ backgroundColor: BLOCK_VAR[block] }} />
              {labels[block]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
