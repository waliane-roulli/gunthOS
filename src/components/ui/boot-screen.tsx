"use client";

import { useEffect, useState, useRef } from "react";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useSettings } from "@/lib/contexts/settings-context";

// ── Helpers ───────────────────────────────────────────────────────────────────

type BootLine = { text: string; delay: number; sound?: "ok" | "error" | "modem" | "hdd" };

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: readonly T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Boot pools ────────────────────────────────────────────────────────────────

const HARDWARE_POOL = [
  "  Imprimante LPT1 : ............................ PLEURE EN SILENCE",
  "  Pile CMOS : .................................. VIDE (heure : 01/01/1980)",
  "  Ventilateur CPU : ............................. BRUYANT. TRÈS BRUYANT.",
  "  Port parallèle : .............................. EXISTENTIELLEMENT PERDU",
  "  Joystick : .................................... DÉTECTÉ (personne ne sait pourquoi)",
  "  Écran : ....................................... RÉSIGNÉ",
  "  Horloge temps réel : .......................... À LA TRAÎNE",
  "  Port série COM1 : ............................. JALOUX DU USB",
] as const;

const DISK_POOL = [
  "  Secteurs irrécupérables : .................... EN DÉNI",
  "  Dernière sauvegarde : ........................ JAMAIS (on dirait)",
  "  Fragmentation : .............................. 97% (record personnel)",
  "  Fichiers orphelins : ......................... 1 247. LAISSEZ-LES.",
  "  Défragmentation conseillée : ................. DEPUIS 3 ANS",
  "  Espace libre : ................................ OPTIMISTE",
] as const;

const DRIVER_POOL = [
  "  SECRETS.SYS ................................... NE PAS OUVRIR",
  "  WIN.COM ....................................... ANXIEUX MAIS FONCTIONNEL",
  "  DOUBLONS.DLL .................................. 3 COPIES. RAISON INCONNUE.",
  "  AUTOEXEC.BAT .................................. A FAIT N'IMPORTE QUOI",
  "  VBRUN300.DLL .................................. REVENU. SANS EXPLICATION.",
  "  CONFIG.SYS .................................... DÉCOURAGÉ",
  "  DELTREE.EXE ................................... NE PAS LANCER",
  "  CHOICE.COM .................................... INDÉCIS",
] as const;

const NETWORK_POOL = [
  "  Surveillance activée : ....................... NE PAS PANIQUER",
  "  Mise à jour disponible : ..................... 847 Mo (durée estimée : 6 jours)",
  "  Fournisseur d'accès : ........................ PAS CONTENT",
  "  Ping : ........................................ ÉLEVÉ. COMME TOUJOURS.",
  "  Pare-feu : .................................... IL ESSAIE",
  "  Protocole TCP/IP : ........................... NÉGOCIATION EN COURS",
  "  DNS : .......................................... OÙ SUIS-JE",
] as const;

const MENTAL_HEALTH_SECTIONS = [
  [
    "Vérification de la santé mentale du système...",
    "  Stabilité psychologique : .................... FRAGILE (comme d'habitude)",
    "  Confiance en l'avenir : ...................... EN COURS D'ÉVALUATION",
  ],
  [
    "Analyse de la personnalité système...",
    "  Complexes refoulés : ......................... NOMBREUX",
    "  Volonté de démarrer : ........................ BASSE MAIS PRÉSENTE",
  ],
  [
    "Bilan existentiel rapide...",
    "  Sens du démarrage : .......................... NON TROUVÉ",
    "  Continuation malgré tout : ................... OUI",
  ],
  [
    "Auto-diagnostic émotionnel...",
    "  Rancœurs accumulées : ........................ 14 (en hausse)",
    "  Espoir résiduel : ............................ DÉTECTÉ (faible signal)",
  ],
] as const;

const STARTUP_POOL = [
  "  Espoirs de l'utilisateur : .................... DÉTECTÉS. PRUDENCE.",
  "  Vérification du sens de la vie : .............. IGNORÉE (faute de temps)",
  "  Optimisme initial : ........................... DÉTECTÉ (profitez-en)",
  "  Attentes déraisonnables : ..................... CHARGÉES",
  "  Illusions de performance : .................... ACTIVÉES",
  "  Café de l'utilisateur : ....................... TROP CHAUD POUR L'INSTANT",
] as const;

const CLOSING_POOL = [
  "  Ça marche 73% du temps, à chaque fois.",
  "  Probabilité de plantage dans l'heure : 34%.",
  "  Durée de vie estimée : encore un peu.",
  "  Mode sans échec disponible (de toute façon).",
  "  Bonne chance. Sincèrement.",
  "  En cas de problème, relancez. En cas de problème grave, relancez plus fort.",
] as const;

function buildBootLines(): BootLine[] {
  const lines: BootLine[] = [];
  let t = 0;

  const add = (text: string, gap = 280, sound?: BootLine["sound"]) => {
    lines.push({ text, delay: t, ...(sound && { sound }) });
    t += gap;
  };
  const blank = (gap = 200) => add("", gap);

  add("GunthOS v1.0 - Copyright (C) 1998 Gunther Corp.", 300);
  add("All rights reserved. Surtout le droit à l'erreur.", 200);
  blank(200);

  add("Détection du matériel en cours...", 300);
  add("  Processeur : Gunth686 DX2 66MHz .............. OK", 300, "ok");
  add("  Mémoire vive : 640K RAM ...................... PAS ASSEZ", 300);
  add("  Mémoire vive (étendue) : 4Mo ................. OK (à peine)", 300);
  add("  Lecteur disquette A: ......................... ABSENT (votre faute)", 300, "hdd");
  add("  Lecteur CD-ROM : ............................. OUVERT (fermez-le)", 300);
  add("  Carte son : SoundBlaster 16 .................. BRUIT DETECÉ", 300);
  add("  Modem 14.4k : ................................ CONNEXION IMMINENTE", 250, "ok");
  const hwCount = Math.random() < 0.5 ? 1 : 2;
  shuffle(HARDWARE_POOL).slice(0, hwCount).forEach(text => add(text, 270));
  blank(200);

  add("Vérification du disque dur...", 300, "hdd");
  add("  C:\\ [XXXXXXXXXXXXXXXXXX____] 2147 erreurs trouvées", 300, "hdd");
  add("  Correction des erreurs : IGNORÉE (on verra plus tard)", 250);
  add(pickRandom(DISK_POOL), 200);
  blank(200);

  add("Chargement des pilotes...", 200);
  add("  HIMEM.SYS ..................................... OK", 200);
  add("  EMM386.EXE .................................... CONFUS", 200);
  add("  MOUSE.COM ..................................... CLIQUÉ", 200);
  add("  GUNTH.DRV ..................................... MYSTÉRIEUX", 200);
  add("  PLOUF.SYS ..................................... MOUILLÉ", 200);
  add(pickRandom(DRIVER_POOL), 200);
  blank(200);

  add("Initialisation réseau...", 300);
  add("  Tentative de connexion à Internet... 14400 bps", 400);
  add("  SKRRRR KSSHHH BOING SKRRRR DING DING KSSSHH", 600, "modem");
  add("  Connexion établie ! (elle tiendra peut-être)", 250);
  add(pickRandom(NETWORK_POOL), 200);
  blank(200);

  pickRandom(MENTAL_HEALTH_SECTIONS).forEach(text => add(text, 250));
  blank(200);

  add("Démarrage de GunthOS...", 300);
  add("  Chargement du bureau ......................... EN COURS", 300);
  add("  Application des préférences .................. OK", 300);
  add("  Activation du papier peint ................... HIDEUX", 300);
  add("  Démarrage automatique ........................ 3 programmes inutiles", 250);
  add(pickRandom(STARTUP_POOL), 200);
  blank(300);

  add("========================================================", 200);
  add("  GunthOS est prêt. Nous pensons.", 200);
  add("  En cas de problème : éteignez et rallumez.", 200);
  add(pickRandom(CLOSING_POOL), 200);
  add("========================================================", 100);
  blank(100);

  return lines;
}

// ── Shutdown pools ────────────────────────────────────────────────────────────

const SHUTDOWN_APP_POOL = [
  "  Paint ..................................... FERMÉ (chef-d'œuvre non sauvegardé)",
  "  Calculatrice .............................. FERMÉE (résultat : 42)",
  "  Winamp .................................... STOPPÉ (au milieu d'un solo)",
  "  Screensaver ............................... INTERROMPU (c'était si beau)",
  "  Minesweeper ............................... FERMÉ (mine non déminée)",
  "  WordPad ................................... FERMÉ (roman inachevé : votre vie)",
] as const;

const SHUTDOWN_CACHE_POOL = [
  "  Sentiments refoulés : ..................... ARCHIVÉS EN .EXE",
  "  Rancœurs de l'utilisateur : .............. MISES EN CACHE",
  "  Espoirs non réalisés : .................... COMPRESSÉS EN ZIP",
  "  Doutes existentiels : ..................... REPORTÉS AU PROCHAIN BOOT",
  "  Regrets du jour : ......................... DÉFRAGMENTÉS",
  "  Souvenirs inutiles : ....................... CONSERVÉS PAR SENTIMENTALISME",
] as const;

const SHUTDOWN_NETWORK_POOL = [
  "  Connexion aux serveurs G Corp™ : ......... MAINTENUE (discrètement)",
  "  Historique de navigation : ............... TRANSMIS (à qui ? mystère)",
  "  Localisation approximative : ............. ENREGISTRÉE",
  "  Cookies tiers : ........................... TRÈS BIEN CONSERVÉS",
  "  Données personnelles : .................... QUELQUE PART",
] as const;

const SHUTDOWN_SYSTEM_POOL = [
  "  Machine à café réseau : .................. ÉTEINTE EN PREMIER",
  "  Songe de l'unité centrale : .............. INTERROMPU",
  "  Processus de fond suspects : ............. LAISSÉS EN PLACE",
  "  Nostalgie système : ....................... SAUVEGARDÉE",
  "  Ventilateur : ............................. ENFIN DU REPOS",
  "  Registre Windows : ........................ INTACT (miracle)",
] as const;

const SHUTDOWN_CLOSING_POOL = [
  "  Rappel : soufflez dans la cartouche avant de rallumer.",
  "  Rappel : ne rallumez pas pendant un orage. Ou si.",
  "  Rappel : la disquette de secours est introuvable.",
  "  Rappel : ça repart rarement mieux qu'avant.",
  "  Rappel : avez-vous essayé d'éteindre et de rallumer ?",
  "  Rappel : vos fichiers non sauvegardés sont partis pour toujours.",
] as const;

function buildShutdownLines(): { text: string; delay: number }[] {
  const lines: { text: string; delay: number }[] = [];
  let t = 0;

  const add = (text: string, gap = 300) => {
    lines.push({ text, delay: t });
    t += gap;
  };
  const blank = (gap = 200) => add("", gap);

  add("GunthOS v1.0 — Procédure d'arrêt initiée.", 200);
  blank(200);

  add("Fermeture des applications en cours...", 300);
  add("  Solitaire ..................................... REFUS (il était en train de gagner)", 350);
  add("  Bloc-notes .................................... FERMÉ (contenu non sauvegardé : votre vie)", 350);
  add("  Internet Explorer ............................. TOUJOURS EN COURS DE FERMETURE", 350);
  add(pickRandom(SHUTDOWN_APP_POOL), 300);
  add("  Processus mystérieux (PID 666) ............... QU'EST-CE QUE C'EST", 300);
  add("  Processus mystérieux (PID 666) ............... IGNORÉ", 150);
  blank(200);

  add("Sauvegarde des préférences...", 250);
  add("  Thème de bureau .............................. ENREGISTRÉ (il était hideux)", 300);
  add("  Raccourcis bureau ............................ 47 icônes sauvegardées", 300);
  add("  Vos données importantes ...................... PEUT-ÊTRE", 200);
  blank(150);

  add("Nettoyage du cache...", 200);
  add("  Fichiers temporaires ......................... 4,7 Go supprimés (ça faisait longtemps)", 350);
  add("  Cookies ...................................... CONSERVÉS (pour la nostalgie)", 350);
  add("  Historique ................................... EFFACÉ. On ne demande pas.", 300);
  add(pickRandom(SHUTDOWN_CACHE_POOL), 250);
  blank(200);

  add("Déconnexion du réseau...", 250);
  add("  Modem 14.4k : raccrochage .................... KSHHH BOING DING KRRSSH", 600);
  add("  Connexion Internet ........................... PERDUE (comme d'habitude)", 300);
  add("  Votre email non lu ........................... 1 message en attente depuis 2002", 300);
  add(pickRandom(SHUTDOWN_NETWORK_POOL), 250);
  blank(200);

  add("Arrêt des services système...", 250);
  add("  Horloge système .............................. STOPPÉE (le temps c'est de l'argent)", 350);
  add("  Gestionnaire de mémoire ...................... LIBÉRÉ (640K, c'est plus que suffisant)", 350);
  add("  Pilote PLOUF.SYS ............................. RESTÉ MOUILLÉ", 300);
  add(pickRandom(SHUTDOWN_SYSTEM_POOL), 300);
  add("  GUNTH.DRV .................................... TOUJOURS MYSTÉRIEUX", 200);
  blank(200);

  add("================================================================", 150);
  add("  GunthOS s'éteint correctement.", 200);
  add("  Merci d'avoir utilisé GunthOS v1.0.", 200);
  add(pickRandom(SHUTDOWN_CLOSING_POOL), 250);
  add("  Au revoir. Nous espérons que vous avez sauvegardé.", 250);
  add("================================================================", 100);
  blank(100);
  add("Il est maintenant sans danger d'éteindre votre ordinateur.", 0);

  return lines;
}

// ── Shutdown screen ───────────────────────────────────────────────────────────

interface ShutdownScreenProps {
  onPowerOn: () => void;
}

export function ShutdownScreen({ onPowerOn }: ShutdownScreenProps) {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<"shutdown" | "off">("shutdown");
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [shutdownLines] = useState(() => buildShutdownLines());
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    shutdownLines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, line.delay)
      );
    });

    const lastDelay = shutdownLines[shutdownLines.length - 1]!.delay;
    timers.push(setTimeout(() => setPhase("off"), lastDelay + 1200));

    return () => timers.forEach(clearTimeout);
  }, [shutdownLines]);

  const crtOverlay = settings.scanlinesEnabled ? (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)" }} />
  ) : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        fontFamily: "var(--font-vt323), monospace",
        background: "#000000",
      }}
    >
      {crtOverlay}
      {phase === "shutdown" && (
        <div
          ref={terminalRef}
          className="flex-1 overflow-hidden p-4 leading-[1.4]"
          style={{ color: "#c0c0c0", fontSize: "clamp(16px, 2.2vw, 22px)" }}
        >
          {shutdownLines.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{ minHeight: "1.4em" }}>
              {line.text}
            </div>
          ))}
          {visibleLines < shutdownLines.length && (
            <span style={{ color: "#c0c0c0" }}>
              {cursorVisible ? "█" : " "}
            </span>
          )}
        </div>
      )}

      {phase === "off" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <p
            style={{
              color: "#404040",
              fontSize: "clamp(15px, 2vw, 20px)",
              letterSpacing: "0.15em",
              fontFamily: "var(--font-vt323), monospace",
            }}
          >
            Il est maintenant sans danger d&apos;éteindre votre ordinateur.
          </p>
          <p
            style={{
              color: "#2a2a2a",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              letterSpacing: "0.1em",
              fontFamily: "var(--font-vt323), monospace",
              textAlign: "center",
            }}
          >
            (Le processus mystérieux PID 666 est toujours en cours d&apos;arrêt.)
          </p>
          <button
            onClick={onPowerOn}
            style={{
              fontFamily: "var(--font-vt323), monospace",
              fontSize: "clamp(18px, 2.2vw, 26px)",
              color: "var(--t-text, #1a1a1a)",
              letterSpacing: "0.25em",
              cursor: "pointer",
              padding: "14px 48px",
              border: "2px solid var(--t-border-dark, #808080)",
              background: "linear-gradient(180deg, var(--t-bg-light, #d8d8d8) 0%, var(--t-bg, #c0c0c0) 50%, var(--t-bg-dark, #a0a0a0) 100%)",
              boxShadow: "0 6px 0 rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.8), inset 0 1px 0 var(--t-border-light, #ffffff)",
              position: "relative",
              top: 0,
              transition: "top 0.06s, box-shadow 0.06s",
            }}
            onMouseDown={(e) => {
              const b = e.currentTarget;
              b.style.top = "4px";
              b.style.boxShadow = "0 2px 0 rgba(0,0,0,0.6), 0 3px 8px rgba(0,0,0,0.8), inset 0 1px 0 var(--t-border-light, #ffffff)";
            }}
            onMouseUp={(e) => {
              const b = e.currentTarget;
              b.style.top = "0px";
              b.style.boxShadow = "0 6px 0 rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.8), inset 0 1px 0 var(--t-border-light, #ffffff)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget;
              b.style.top = "0px";
              b.style.boxShadow = "0 6px 0 rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.8), inset 0 1px 0 var(--t-border-light, #ffffff)";
            }}
          >
            ⏻ ALLUMER
          </button>
        </div>
      )}
    </div>
  );
}

// ── Boot screen ───────────────────────────────────────────────────────────────

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
  const { settings } = useSettings();
  const [phase, setPhase] = useState<"bios" | "loading" | "done">("bios");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState(PROGRESS_STEPS[0]!.label);
  const [fadeOut, setFadeOut] = useState(false);
  const [bootLines] = useState(() => buildBootLines());
  const terminalRef = useRef<HTMLDivElement>(null);
  const skippedRef = useRef(false);
  const tapTimesRef = useRef<number[]>([]);
  const { init, playBiosBleep, playModemDialup, playStartupChime, startBootAudio, stopBootAudio, startAccessDisk, stopAccessDisk } = useSoundContext();

  // Skip on Escape or Space
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== " ") return;
      if (skippedRef.current) return;
      skippedRef.current = true;
      stopBootAudio();
      stopAccessDisk();
      onComplete();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onComplete, stopBootAudio, stopAccessDisk]);

  // Skip on 3 rapid taps (mobile)
  const handleTap = () => {
    if (skippedRef.current) return;
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].filter((t) => now - t < 600);
    if (tapTimesRef.current.length >= 3) {
      skippedRef.current = true;
      stopBootAudio();
      stopAccessDisk();
      onComplete();
    }
  };

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // BIOS text lines + sons
  useEffect(() => {
    if (phase !== "bios") return;
    init();
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => { playBiosBleep("start"); startBootAudio(); }, 50));

    bootLines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
          if (line.sound === "ok") playBiosBleep("ok");
          else if (line.sound === "modem") playModemDialup();
        }, line.delay)
      );
    });

    const lastDelay = bootLines[bootLines.length - 1]!.delay;
    timers.push(setTimeout(() => setPhase("loading"), lastDelay + 600));
    return () => timers.forEach(clearTimeout);
  }, [phase, bootLines, init, playBiosBleep, playModemDialup, startBootAudio]);

  // Progress bar — access_disk.mp3 pendant le chargement, chime à la fin
  useEffect(() => {
    if (phase !== "loading") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const stepDuration = 2400 / PROGRESS_STEPS.length;

    stopBootAudio();
    startAccessDisk();

    PROGRESS_STEPS.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setProgress(step.pct);
          setProgressLabel(step.label);
        }, i * stepDuration)
      );
    });

    const totalDuration = PROGRESS_STEPS.length * stepDuration;

    timers.push(setTimeout(() => {
      stopAccessDisk();
      playStartupChime();
    }, totalDuration - 200));

    timers.push(setTimeout(() => {
      setFadeOut(true);
      timers.push(setTimeout(onComplete, 700));
    }, totalDuration + 400));

    return () => {
      timers.forEach(clearTimeout);
      stopAccessDisk();
    };
  }, [phase, onComplete, playStartupChime, stopBootAudio, startAccessDisk, stopAccessDisk]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        fontFamily: "var(--font-vt323), monospace",
        background: "#000000",
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? "opacity 0.6s ease" : "none",
      }}
      onClick={handleTap}
    >
      {settings.scanlinesEnabled && <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)" }} />}
      {phase === "bios" && (
        <div
          ref={terminalRef}
          className="flex-1 overflow-hidden p-4 leading-[1.4]"
          style={{ color: "#c0c0c0", fontSize: "clamp(16px, 2.2vw, 22px)" }}
        >
          {bootLines.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{ minHeight: "1.4em" }}>
              {line.text}
            </div>
          ))}
          {visibleLines < bootLines.length && (
            <span style={{ color: "#c0c0c0" }}>
              {cursorVisible ? "█" : " "}
            </span>
          )}
        </div>
      )}

      {/* Mobile skip hint — only visible on touch devices */}
      <div
        className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center"
        style={{
          fontFamily: "var(--font-vt323), monospace",
          fontSize: "clamp(13px, 1.8vw, 16px)",
          color: "#404040",
          letterSpacing: "0.1em",
        }}
      >
        <span className="hidden-on-mouse">appuyez 3× pour passer</span>
      </div>

      {phase === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-0" style={{ color: "var(--t-text, #c0c0c0)" }}>
          {/* Retro-style logo block — uses theme vars with Win95 fallbacks */}
          <div
            className="mb-10 text-center"
            style={{
              border: "2px solid",
              borderTopColor: "var(--t-border-light, #ffffff)",
              borderLeftColor: "var(--t-border-light, #ffffff)",
              borderBottomColor: "var(--t-border-dark, #404040)",
              borderRightColor: "var(--t-border-dark, #404040)",
              backgroundColor: "var(--t-bg, #c0c0c0)",
              padding: "0",
              width: "clamp(320px, 60vw, 520px)",
            }}
          >
            {/* Titlebar */}
            <div
              className="flex items-center gap-2 px-2 py-1"
              style={{
                background: "linear-gradient(90deg, var(--t-titlebar-from, #000080), var(--t-titlebar-to, #1084d0))",
                color: "var(--t-titlebar-text, #ffffff)",
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
                  color: "var(--t-accent, #000080)",
                  fontFamily: "var(--font-vt323), monospace",
                  fontSize: "clamp(28px, 5vw, 52px)",
                  lineHeight: 1,
                  textShadow: "2px 2px 0 var(--t-border-dark, #808080)",
                }}
              >
                GunthOS
              </div>
              <div
                style={{
                  color: "var(--t-text, #000000)",
                  fontSize: "clamp(15px, 2vw, 20px)",
                  fontFamily: "var(--font-vt323), monospace",
                }}
              >
                Version 1.0 — Certifié compatible avec lui-même
              </div>

              {/* Progress bar */}
              <div className="w-full flex flex-col gap-2">
                <div
                  style={{
                    border: "2px solid",
                    borderTopColor: "var(--t-border-dark, #808080)",
                    borderLeftColor: "var(--t-border-dark, #808080)",
                    borderBottomColor: "var(--t-border-light, #ffffff)",
                    borderRightColor: "var(--t-border-light, #ffffff)",
                    backgroundColor: "var(--t-app-bg, #ffffff)",
                    height: "22px",
                    padding: "2px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, var(--t-progress-from, #000080), var(--t-progress-to, #1084d0))",
                      transition: "width 0.28s linear",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "clamp(14px, 1.8vw, 18px)",
                    color: "var(--t-text-muted, #000000)",
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
              fontSize: "clamp(14px, 1.7vw, 18px)",
              color: "var(--t-text-subtle, #808080)",
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
