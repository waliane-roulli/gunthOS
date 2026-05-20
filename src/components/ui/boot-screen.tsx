"use client";

import { useEffect, useState, useRef } from "react";

const BOOT_LINES = [
  { text: "GunthOS v1.0 - Copyright (C) 1998 Gunther Corp.", delay: 0 },
  { text: "All rights reserved. Surtout le droit à l'erreur.", delay: 300 },
  { text: "", delay: 500 },
  { text: "Détection du matériel en cours...", delay: 700 },
  { text: "  Processeur : Gunth686 DX2 66MHz .............. OK", delay: 1000 },
  { text: "  Mémoire vive : 640K RAM ...................... PAS ASSEZ", delay: 1300 },
  { text: "  Mémoire vive (étendue) : 4Mo ................. OK (à peine)", delay: 1600 },
  { text: "  Lecteur disquette A: ......................... ABSENT (votre faute)", delay: 1900 },
  { text: "  Lecteur CD-ROM : ............................. OUVERT (fermez-le)", delay: 2200 },
  { text: "  Carte son : SoundBlaster 16 .................. BRUIT DETECÉ", delay: 2500 },
  { text: "  Modem 14.4k : ................................ CONNEXION IMMINENTE", delay: 2800 },
  { text: "", delay: 3000 },
  { text: "Vérification du disque dur...", delay: 3100 },
  { text: "  C:\\ [XXXXXXXXXXXXXXXXXX____] 2147 erreurs trouvées", delay: 3400 },
  { text: "  Correction des erreurs : IGNORÉE (on verra plus tard)", delay: 3700 },
  { text: "", delay: 3900 },
  { text: "Chargement des pilotes...", delay: 4000 },
  { text: "  HIMEM.SYS ..................................... OK", delay: 4200 },
  { text: "  EMM386.EXE .................................... CONFUS", delay: 4400 },
  { text: "  MOUSE.COM ..................................... CLIQUÉ", delay: 4600 },
  { text: "  GUNTH.DRV ..................................... MYSTÉRIEUX", delay: 4800 },
  { text: "  PLOUF.SYS ..................................... MOUILLÉ", delay: 5000 },
  { text: "", delay: 5200 },
  { text: "Initialisation réseau...", delay: 5300 },
  { text: "  Tentative de connexion à Internet... 14400 bps", delay: 5600 },
  { text: "  SKRRRR KSSHHH BOING SKRRRR DING DING KSSSHH", delay: 6000 },
  { text: "  Connexion établie ! (elle tiendra peut-être)", delay: 6600 },
  { text: "", delay: 6800 },
  { text: "Démarrage de GunthOS...", delay: 6900 },
  { text: "  Chargement du bureau ......................... EN COURS", delay: 7200 },
  { text: "  Application des préférences .................. OK", delay: 7500 },
  { text: "  Activation du papier peint ................... HIDEUX", delay: 7800 },
  { text: "  Démarrage automatique ........................ 3 programmes inutiles", delay: 8100 },
  { text: "", delay: 8400 },
  { text: "========================================================", delay: 8500 },
  { text: "  GunthOS est prêt. Nous pensons.", delay: 8700 },
  { text: "  En cas de problème : éteignez et rallumez.", delay: 8900 },
  { text: "  Ça marche 73% du temps, à chaque fois.", delay: 9100 },
  { text: "========================================================", delay: 9300 },
  { text: "", delay: 9400 },
];

const PROGRESS_STEPS = [
  { label: "Initialisation du noyau Gunth...", pct: 8 },
  { label: "Chargement des pilotes suspects...", pct: 22 },
  { label: "Négociation avec le matériel...", pct: 35 },
  { label: "Application des rustines...", pct: 48 },
  { label: "Chargement de l'interface graphique...", pct: 61 },
  { label: "Activation des effets sonores inutiles...", pct: 74 },
  { label: "Démarrage des applications en arrière-plan...", pct: 85 },
  { label: "Presque prêt (vraiment cette fois)...", pct: 94 },
  { label: "Bienvenue dans GunthOS v1.0 !", pct: 100 },
];

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<"bios" | "loading" | "done">("bios");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState(PROGRESS_STEPS[0].label);
  const [fadeOut, setFadeOut] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // BIOS text lines
  useEffect(() => {
    if (phase !== "bios") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, line.delay)
      );
    });
    const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay;
    timers.push(setTimeout(() => setPhase("loading"), lastDelay + 600));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Progress bar
  useEffect(() => {
    if (phase !== "loading") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const stepDuration = 2400 / PROGRESS_STEPS.length;
    PROGRESS_STEPS.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setProgress(step.pct);
          setProgressLabel(step.label);
        }, i * stepDuration)
      );
    });
    timers.push(
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(onComplete, 700);
      }, PROGRESS_STEPS.length * stepDuration + 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        fontFamily: "var(--font-vt323), monospace",
        background: "#000000",
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? "opacity 0.6s ease" : "none",
      }}
    >
      {phase === "bios" && (
        <div
          ref={terminalRef}
          className="flex-1 overflow-hidden p-4 leading-[1.4]"
          style={{ color: "#c0c0c0", fontSize: "clamp(13px, 1.8vw, 18px)" }}
        >
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{ minHeight: "1.4em" }}>
              {line.text}
            </div>
          ))}
          {visibleLines < BOOT_LINES.length && (
            <span style={{ color: "#c0c0c0" }}>
              {cursorVisible ? "█" : " "}
            </span>
          )}
        </div>
      )}

      {phase === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-0" style={{ color: "#c0c0c0" }}>
          {/* Win95-style logo block */}
          <div
            className="mb-10 text-center"
            style={{
              border: "2px solid",
              borderTopColor: "#ffffff",
              borderLeftColor: "#ffffff",
              borderBottomColor: "#404040",
              borderRightColor: "#404040",
              background: "#c0c0c0",
              padding: "0",
              width: "clamp(320px, 60vw, 520px)",
            }}
          >
            {/* Titlebar */}
            <div
              className="flex items-center gap-2 px-2 py-1"
              style={{
                background: "linear-gradient(90deg, #000080, #1084d0)",
                color: "#ffffff",
                fontFamily: "var(--font-vt323), monospace",
                fontSize: "clamp(16px, 2vw, 20px)",
              }}
            >
              <span>💾</span>
              <span>GunthOS v1.0 — Démarrage du système</span>
            </div>
            {/* Content */}
            <div className="p-6 pb-8 flex flex-col items-center gap-6">
              <div
                className="text-center"
                style={{
                  color: "#000080",
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "clamp(28px, 5vw, 52px)",
                  lineHeight: 1,
                  textShadow: "2px 2px 0 #808080",
                }}
              >
                GunthOS
              </div>
              <div
                style={{
                  color: "#000000",
                  fontSize: "clamp(12px, 1.6vw, 16px)",
                  fontFamily: "var(--font-vt323), monospace",
                }}
              >
                Version 1.0 — Certifié compatible avec lui-même
              </div>

              {/* Progress bar Win95 style */}
              <div className="w-full flex flex-col gap-2">
                <div
                  style={{
                    border: "2px solid",
                    borderTopColor: "#808080",
                    borderLeftColor: "#808080",
                    borderBottomColor: "#ffffff",
                    borderRightColor: "#ffffff",
                    background: "#ffffff",
                    height: "22px",
                    padding: "2px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: "repeating-linear-gradient(90deg, #000080 0px, #000080 18px, #1084d0 18px, #1084d0 20px)",
                      transition: "width 0.28s linear",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "clamp(11px, 1.4vw, 14px)",
                    color: "#000000",
                    fontFamily: "var(--font-vt323), monospace",
                    textAlign: "center",
                    minHeight: "1.4em",
                  }}
                >
                  {progressLabel}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "clamp(11px, 1.3vw, 14px)",
              color: "#808080",
              fontFamily: "var(--font-vt323), monospace",
            }}
          >
            © 1998 Gunther Corp. | Ne pas éteindre pendant la mise à jour. Ou si.
          </div>
        </div>
      )}
    </div>
  );
}
