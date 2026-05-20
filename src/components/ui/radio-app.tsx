"use client";

import { useState, useEffect } from "react";
import { useRadio, STATIONS, type StationId } from "@/lib/contexts/radio-context";

const BUFFER_MESSAGES = [
  "Négociation du flux audio avec le serveur...",
  "Chargement des fréquences hertziennes...",
  "Calibration du tuner GunthFM™...",
  "Connexion au satellite (il fait froid là-haut)...",
  "Décompression des ondes radio...",
  "Synchronisation avec la tour de contrôle...",
  "Réglage de l'antenne (soufflez dessus)...",
];

const PLAYING_STATUSES = [
  "EN DIRECT • FRÉQUENCE GROOVE",
  "DIFFUSION EN COURS • 128 kbps",
  "SIGNAL FORT • QUALITÉ OPTIMALE",
  "STREAMING • NE PAS DÉBRANCHER",
  "EN ONDES • DEPUIS 1998",
];

const ERROR_MESSAGES = [
  "Signal perdu. Le hamster qui fait tourner les serveurs est en pause.",
  "Connexion échouée. Avez-vous payé votre abonnement internet ?",
  "Erreur 404 : musique non trouvée dans votre secteur.",
  "Le flux audio s'est évaporé. Comme vos économies.",
  "Timeout. Le serveur réfléchit encore.",
];

const EQUALIZER_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function Equalizer({ active }: { active: boolean }) {
  const [bars, setBars] = useState([3, 5, 2, 7, 4, 6, 1, 5, 3, 6, 2, 4]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setBars((b) => b.map(() => Math.floor(Math.random() * EQUALIZER_CHARS.length)));
    }, 120);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 20 }}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            color: active ? "var(--t-accent)" : "var(--t-text-subtle)",
            opacity: active ? 1 : 0.3,
            display: "inline-block",
            width: 8,
            textAlign: "center",
            fontSize: 10,
            lineHeight: 1,
          }}
        >
          {active ? EQUALIZER_CHARS[h] : "▁"}
        </span>
      ))}
    </div>
  );
}

function TrayBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 border-[2px] flex items-center justify-center text-sm cursor-pointer select-none"
      style={{
        backgroundColor: "var(--t-bg)",
        color: "var(--t-text)",
        fontFamily: "var(--t-font-display)",
        borderTopColor: "var(--t-border-light)",
        borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.borderTopColor = "var(--t-border-dark)";
        e.currentTarget.style.borderLeftColor = "var(--t-border-dark)";
        e.currentTarget.style.borderBottomColor = "var(--t-border-light)";
        e.currentTarget.style.borderRightColor = "var(--t-border-light)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.borderTopColor = "var(--t-border-light)";
        e.currentTarget.style.borderLeftColor = "var(--t-border-light)";
        e.currentTarget.style.borderBottomColor = "var(--t-border-dark)";
        e.currentTarget.style.borderRightColor = "var(--t-border-dark)";
      }}
    >
      {children}
    </button>
  );
}

export function RadioApp() {
  const { currentStation, isBuffering, isPlaying, hasError, volume, playTime, play, stop, next, prev, setVolume } = useRadio();
  const [bufferMsg, setBufferMsg] = useState(BUFFER_MESSAGES[0]!);
  const [statusMsg, setStatusMsg] = useState(PLAYING_STATUSES[0]!);
  const [errorMsg] = useState(() => pickRandom(ERROR_MESSAGES));

  useEffect(() => {
    if (!isBuffering) return;
    setBufferMsg(pickRandom(BUFFER_MESSAGES));
    const id = setInterval(() => setBufferMsg(pickRandom(BUFFER_MESSAGES)), 1200);
    return () => clearInterval(id);
  }, [isBuffering]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setStatusMsg(pickRandom(PLAYING_STATUSES)), 4000);
    return () => clearInterval(id);
  }, [isPlaying]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)", minHeight: 0 }}>
      {/* Header / Now playing */}
      <div
        className="shrink-0 p-4 border-b-2 flex flex-col gap-3"
        style={{
          borderColor: "var(--t-border-dark)",
          background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{isPlaying ? currentStation?.emoji : "📻"}</span>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold tracking-widest truncate" style={{ color: "var(--t-accent)" }}>
              {isPlaying
                ? currentStation?.name.toUpperCase()
                : isBuffering ? "CONNEXION..."
                : hasError ? "⚠ ERREUR SIGNAL"
                : "FRÉQUENCE GROOVE™"}
            </div>
            <div className="text-xs tracking-wider truncate" style={{ color: "var(--t-text-muted)" }}>
              {isPlaying
                ? currentStation?.description
                : isBuffering ? bufferMsg
                : hasError ? errorMsg
                : "GunthRadio v2.0 — Qualité Web 1.0 garantie"}
            </div>
          </div>
          {isPlaying && (
            <div className="text-xs tracking-widest tabular-nums shrink-0" style={{ color: "var(--t-text-muted)" }}>
              {formatTime(playTime)}
            </div>
          )}
        </div>

        {/* Equalizer + status */}
        <div className="flex items-center justify-between gap-4">
          <Equalizer active={isPlaying} />
          <div
            className="text-xs tracking-widest"
            style={{ color: isPlaying ? "var(--t-accent)" : "var(--t-text-subtle)" }}
          >
            {isPlaying ? `● ${statusMsg}` : isBuffering ? "⏳ BUFFER..." : "○ ARRÊTÉ"}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <TrayBtn onClick={prev} title="Station précédente">⏮</TrayBtn>
          <TrayBtn
            onClick={() => {
              if (isPlaying) stop();
              else if (currentStation) play(currentStation.id as StationId);
            }}
            title={isPlaying ? "Pause" : "Lecture"}
          >
            {isBuffering ? "⏳" : isPlaying ? "■" : "▶"}
          </TrayBtn>
          <TrayBtn onClick={next} title="Station suivante">⏭</TrayBtn>

          {/* Volume */}
          <span className="text-xs tracking-widest ml-2 shrink-0" style={{ color: "var(--t-text-muted)" }}>VOL</span>
          <div
            className="flex-1 h-4 border-[2px] relative cursor-pointer"
            style={{
              borderTopColor: "var(--t-border-dark)",
              borderLeftColor: "var(--t-border-dark)",
              borderBottomColor: "var(--t-border-light)",
              borderRightColor: "var(--t-border-light)",
              backgroundColor: "var(--t-app-bg)",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const v = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              setVolume(Math.max(0, Math.min(100, v)));
            }}
          >
            <div
              className="h-full"
              style={{
                width: `${volume}%`,
                background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
              }}
            />
          </div>
          <span className="text-xs tracking-widest tabular-nums w-8 text-right shrink-0" style={{ color: "var(--t-text-muted)" }}>
            {volume}%
          </span>
        </div>
      </div>

      {/* Station list */}
      <div className="flex-1 overflow-auto">
        {STATIONS.map((s) => {
          const isCurrent = currentStation?.id === s.id;
          const isThisBuffering = isCurrent && isBuffering;
          const isThisPlaying = isCurrent && isPlaying;
          const isThisError = isCurrent && hasError;

          return (
            <div
              key={s.id}
              className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer select-none"
              style={{
                borderColor: "var(--t-border-dark)",
                backgroundColor: isCurrent ? "var(--t-card-hover)" : "transparent",
                borderLeft: isCurrent ? "3px solid var(--t-accent)" : "3px solid transparent",
              }}
              onClick={() => {
                if (isCurrent && isPlaying) stop();
                else play(s.id as StationId);
              }}
            >
              <div
                className="shrink-0 w-7 h-7 border-[2px] flex items-center justify-center text-sm"
                style={{
                  borderTopColor: isThisPlaying ? "var(--t-border-dark)" : "var(--t-border-light)",
                  borderLeftColor: isThisPlaying ? "var(--t-border-dark)" : "var(--t-border-light)",
                  borderBottomColor: isThisPlaying ? "var(--t-border-light)" : "var(--t-border-dark)",
                  borderRightColor: isThisPlaying ? "var(--t-border-light)" : "var(--t-border-dark)",
                  backgroundColor: "var(--t-bg)",
                  color: isThisPlaying ? "var(--t-accent)" : "var(--t-text-muted)",
                }}
              >
                {isThisBuffering ? "⏳" : isThisPlaying ? "■" : isThisError ? "⚠" : "▶"}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-bold tracking-widest truncate"
                  style={{ color: isThisPlaying ? "var(--t-accent)" : "var(--t-text)" }}
                >
                  {s.emoji} {s.name}
                </div>
                <div className="text-xs tracking-wider truncate" style={{ color: "var(--t-text-muted)" }}>
                  {isThisError ? errorMsg : s.description}
                </div>
              </div>

              <div
                className="shrink-0 text-xs tracking-widest px-2 py-0.5 border"
                style={{
                  borderColor: isThisPlaying ? "var(--t-accent)" : "var(--t-border-dark)",
                  color: isThisPlaying ? "var(--t-accent)" : "var(--t-text-subtle)",
                  backgroundColor: "var(--t-bg)",
                }}
              >
                {s.genre}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-4 py-1.5 border-t flex justify-between text-xs tracking-widest"
        style={{
          borderColor: "var(--t-border-dark)",
          color: "var(--t-text-muted)",
          backgroundColor: "var(--t-bg)",
        }}
      >
        <span>GunthRadio™ — Fréquence Groove</span>
        <span>{STATIONS.length} stations • 0 pub</span>
      </div>
    </div>
  );
}
