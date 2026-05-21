"use client";

import { useState, useEffect, useRef } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
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

export function DefragApp(_: AppProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(DEFRAG_MESSAGES[0]!);
  const [blocks, setBlocks] = useState<DefragBlock[]>(() =>
    Array.from({ length: 120 }, randomBlock)
  );
  const [done, setDone] = useState(false);
  const [restarted, setRestarted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (done) return;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 1.2;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDone(true);
          return 100;
        }
        setMessage(pickRandom(DEFRAG_MESSAGES)!);
        setBlocks((b) => b.map((c) => (Math.random() < 0.08 ? randomBlock() : c)));
        return next;
      });
    }, 180);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [done, restarted]);

  function handleRestart() {
    setProgress(0);
    setDone(false);
    setRestarted((r) => r + 1);
    setMessage(DEFRAG_MESSAGES[0]!);
  }

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="text-sm tracking-widest" style={{ color: "var(--t-text-muted)" }}>
        DÉFRAGMENTEUR DE DISQUE GUNTH — Disque C:\\ (847 Mo utilisés sur 850 Mo)
      </div>

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

      <div>
        <div className="text-sm tracking-wider mb-1" style={{ color: "var(--t-text)" }}>
          {done ? "✅ Défragmentation terminée. Redémarrage recommandé." : message}
        </div>
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
              background: "linear-gradient(to right, var(--t-progress-from), var(--t-progress-to))",
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

      {done && (
        <div
          className="text-center text-sm tracking-wider p-2 border"
          style={{
            color: "var(--t-text-muted)",
            borderColor: "var(--t-border-dark)",
            backgroundColor: "var(--t-inset-from)",
          }}
        >
          Résultat : votre disque est exactement aussi fragmenté qu&apos;avant.
          <br />
          <button
            className="mt-2 px-4 py-1 border-[2px] cursor-pointer text-sm tracking-widest"
            style={{
              backgroundColor: "var(--t-bg)",
              color: "var(--t-text)",
              fontFamily: "var(--t-font-display)",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
            }}
            onClick={handleRestart}
          >
            Défragmenter à nouveau (déconseillé)
          </button>
        </div>
      )}

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
