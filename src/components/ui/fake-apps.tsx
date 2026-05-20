"use client";

import { useState, useEffect, useRef } from "react";
import { pickRandom } from "@/lib/gunth-jokes";

// ── Solitaire ────────────────────────────────────────────────────────────────

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RED = new Set(["♥", "♦"]);

function makeCard() {
  const s = pickRandom(SUITS)!;
  const v = pickRandom(VALUES)!;
  return { s, v, red: RED.has(s) };
}

const SOLITAIRE_TAUNTS = [
  "Bonne chance. Tu en auras besoin.",
  "GunthOS Solitaire™ — édition non-gagnante.",
  "Rappel : tu peux pas gagner.",
  "Score actuel : 0. Score final : 0.",
  "Statistiques : 0 victoires sur ∞ parties.",
];

export function SolitaireApp() {
  const [cards] = useState(() => Array.from({ length: 7 }, makeCard));
  const [taunt] = useState(() => pickRandom(SOLITAIRE_TAUNTS));
  const [clicked, setClicked] = useState<number | null>(null);

  return (
    <div className="p-4 flex flex-col gap-4 select-none" style={{ fontFamily: "var(--t-font-display)" }}>
      <div
        className="text-center text-sm tracking-widest py-1 border"
        style={{ color: "var(--t-text-muted)", borderColor: "var(--t-border-dark)" }}
      >
        {taunt}
      </div>

      {/* Stock + waste */}
      <div className="flex gap-3 items-start">
        <div
          className="w-14 h-20 border-[2px] flex items-center justify-center text-xl cursor-pointer"
          style={{
            background: "linear-gradient(135deg, var(--t-titlebar-from), var(--t-titlebar-to))",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
          onClick={() => setClicked(-1)}
          title="Retourner une carte"
        >
          <span style={{ color: "var(--t-titlebar-text)", fontSize: "1.2rem" }}>🂠</span>
        </div>
        <div
          className="w-14 h-20 border-[2px] flex items-center justify-center"
          style={{
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            color: "var(--t-text-muted)",
            fontSize: "1.5rem",
          }}
        >
          {clicked === -1 ? <span style={{ color: "var(--t-accent)" }}>✕</span> : ""}
        </div>

        {/* Foundations */}
        <div className="flex gap-2 ml-auto">
          {SUITS.map((s) => (
            <div
              key={s}
              className="w-14 h-20 border-[2px] flex items-center justify-center text-2xl"
              style={{
                borderTopColor: "var(--t-border-dark)",
                borderLeftColor: "var(--t-border-dark)",
                borderBottomColor: "var(--t-border-light)",
                borderRightColor: "var(--t-border-light)",
                color: RED.has(s) ? "var(--t-defrag-fragmented, #cc0000)" : "var(--t-app-text)",
                opacity: 0.4,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="flex gap-2 justify-center">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => setClicked(i)}
            className="w-14 h-20 border-[2px] flex flex-col items-start justify-start p-1 cursor-pointer"
            style={{
              backgroundColor: clicked === i ? "var(--t-card-hover)" : "var(--t-app-bg)",
              borderTopColor: clicked === i ? "var(--t-border-dark)" : "var(--t-border-light)",
              borderLeftColor: clicked === i ? "var(--t-border-dark)" : "var(--t-border-light)",
              borderBottomColor: clicked === i ? "var(--t-border-light)" : "var(--t-border-dark)",
              borderRightColor: clicked === i ? "var(--t-border-light)" : "var(--t-border-dark)",
              color: c.red ? "var(--t-defrag-fragmented, #cc0000)" : "var(--t-app-text)",
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            <span>{c.v}</span>
            <span>{c.s}</span>
          </button>
        ))}
      </div>

      <div
        className="text-center text-sm tracking-wider"
        style={{ color: "var(--t-text-muted)" }}
      >
        {clicked !== null && clicked !== -1
          ? `Carte sélectionnée : ${cards[clicked]?.v}${cards[clicked]?.s} — Dépose-la quelque part (spoiler : ça marchera pas)`
          : "Double-cliquez pour déplacer une carte (fonctionnalité en cours de développement depuis 2001)"}
      </div>
    </div>
  );
}

// ── Défragmenteur ────────────────────────────────────────────────────────────

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

export function DefragApp() {
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

      {/* Block map */}
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

      {/* Progress bar */}
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

      {/* Légende */}
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
              <span
                className="inline-block w-3 h-3 border border-black/20"
                style={{ backgroundColor: BLOCK_VAR[block] }}
              />
              {labels[block]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Bloc-notes ───────────────────────────────────────────────────────────────

const NOTEPAD_PLACEHOLDER = `Bienvenue dans Bloc-Notes GunthOS.

Ce fichier a été créé automatiquement par GunthOS
lors d'une mise à jour du 25/03/1998.

NE PAS SUPPRIMER CE FICHIER
(suppression interdite par le CLUF GunthOS §47.3.b)

Contenu du fichier système :
> ERREUR_LECTURE_SECTEUR_847
> ERREUR_LECTURE_SECTEUR_848
> ERREUR_LECTURE_SECTEUR_849
> [données corrompues]
> [données corrompues]
> TODO: réparer les données corrompues

GunthOS vous remercie de votre confiance.`;

const SAVE_RESPONSES = [
  "Sauvegardé dans C:\\GUNTH\\TEMP\\UNTITLED(1).txt",
  "Sauvegardé… ou pas. Le disque est plein.",
  "Fichier sauvegardé. Écrasement de la sauvegarde précédente.",
  "Erreur : impossible de sauvegarder. Sauvegardé quand même.",
];

export function NotepadApp() {
  const [text, setText] = useState(NOTEPAD_PLACEHOLDER);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  function handleSave() {
    setSaved(true);
    setSaveCount((c) => c + 1);
    setTimeout(() => setSaved(false), 3000);
  }

  const saveMsg = saveCount > 0
    ? `Sauvegarde ${saveCount} effectuée. Les ${saveCount - 1} précédentes ont été perdues.`
    : pickRandom(SAVE_RESPONSES)!;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      {/* Menu bar */}
      <div
        className="flex gap-4 px-2 py-0.5 text-sm border-b shrink-0"
        style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text)" }}
      >
        {["Fichier", "Édition", "Format", "Affichage", "Aide"].map((m) => (
          <button
            key={m}
            className="hover:opacity-70 cursor-pointer tracking-wider"
            onClick={m === "Fichier" ? handleSave : undefined}
            style={{ background: "none", border: "none", color: "inherit", fontFamily: "inherit" }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Editor — uses --t-app-bg / --t-app-text so it adapts per theme */}
      <textarea
        className="flex-1 p-2 resize-none text-sm tracking-wide outline-none"
        style={{
          backgroundColor: "var(--t-app-bg)",
          color: "var(--t-app-text)",
          fontFamily: "var(--t-font-mono)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          border: "none",
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />

      {/* Status bar */}
      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0"
        style={{
          borderColor: "var(--t-border-dark)",
          color: "var(--t-text-muted)",
          backgroundColor: "var(--t-bg)",
        }}
      >
        {saved
          ? `✅ ${saveMsg}`
          : `Ligne 1, Col 1 — ${text.length} caractères — Encodage : GUNTH-1252`}
      </div>
    </div>
  );
}

// ── Imprimante ───────────────────────────────────────────────────────────────

const PRINT_ERRORS = [
  "ERREUR : Imprimante hors ligne. Elle a toujours été hors ligne.",
  "ERREUR : Bourrage papier (plateau 1, 2 et 3).",
  "ERREUR : Encre noire vide. Encre couleur aussi. En fait toutes.",
  "ERREUR : Pilote introuvable. Il n'a jamais été trouvé.",
  "ERREUR : Connexion USB perdue. Essayez de souffler dedans.",
  "ERREUR : Le papier n'est pas du bon format (GunthOS attend du A4½).",
  "AVERTISSEMENT : 0 feuilles restantes. Impression annulée avec succès.",
  "SUCCÈS : Document imprimé. Sur l'imprimante de votre voisin.",
];

export function PrinterApp() {
  const [queue, setQueue] = useState<{ name: string; status: string; pages: number }[]>([
    { name: "Document1.doc", status: "En attente depuis 2003", pages: 47 },
    { name: "CV_FINAL_v12.doc", status: "Bloqué (bourrage papier)", pages: 3 },
    { name: "Photo_vacances_1999.bmp", status: "En cours d'impression (3%)", pages: 1 },
  ]);
  const [log, setLog] = useState<string[]>([]);

  function handlePrint() {
    const msg = pickRandom(PRINT_ERRORS)!;
    setLog((l) => [msg, ...l].slice(0, 5));
    setQueue((q) => [
      ...q,
      {
        name: `Nouveau_document_${q.length + 1}.txt`,
        status: "En attente",
        pages: Math.floor(Math.random() * 20) + 1,
      },
    ]);
  }

  function handleClear() {
    setLog([]);
    setQueue((q) => q.filter((_, i) => i === 0));
  }

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="flex items-center gap-3">
        <span className="text-4xl">🖨️</span>
        <div>
          <div className="text-sm font-bold tracking-widest" style={{ color: "var(--t-accent)" }}>
            GunthPrint 3000™
          </div>
          <div className="text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>
            État : HORS LIGNE (permanent) — Encre : ▓░░░░░░░░░ 3%
          </div>
        </div>
      </div>

      {/* File de d'attente */}
      <div
        className="border-[2px]"
        style={{
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        <div
          className="px-2 py-1 text-sm tracking-widest border-b font-bold"
          style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text)", backgroundColor: "var(--t-bg-dark)" }}
        >
          FILE D&apos;IMPRESSION ({queue.length} document{queue.length > 1 ? "s" : ""})
        </div>
        {queue.map((doc, i) => (
          <div
            key={i}
            className="px-2 py-1.5 border-b flex justify-between items-center text-sm tracking-wider"
            style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text)" }}
          >
            <span>📄 {doc.name}</span>
            <span style={{ color: "var(--t-text-muted)" }}>{doc.pages}p — {doc.status}</span>
          </div>
        ))}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div
          className="border-[2px] p-2 text-sm tracking-wider flex flex-col gap-1"
          style={{
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            backgroundColor: "var(--t-inset-from)",
            color: "var(--t-defrag-fragmented, #cc2200)",
          }}
        >
          {log.map((l, i) => <div key={i}>⚠ {l}</div>)}
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-2">
        <button
          onClick={handlePrint}
          className="px-4 py-1 border-[2px] text-sm tracking-widest cursor-pointer"
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
          🖨️ Imprimer
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-1 border-[2px] text-sm tracking-widest cursor-pointer"
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
          Vider la file (inutile)
        </button>
      </div>
    </div>
  );
}

// ── Internet Explorer ─────────────────────────────────────────────────────────

const IE_ERRORS = [
  "Cette page ne peut pas être affichée.",
  "Connexion au serveur expirée. Reconnectez le câble RJ-45.",
  "Erreur ActiveX : composant manquant. Voulez-vous l'installer ? (Ne cliquez pas Oui)",
  "Le certificat de sécurité a expiré en 2004.",
  "Macromedia Flash Player requis. Version 2.0 minimum.",
  "Erreur de script ligne 1 : \"Internet\" is not defined.",
  "Avertissement : ce site utilise des cookies. Des vrais. Au chocolat.",
];

const FAKE_SITES = [
  { url: "http://www.google.com", joke: "Connexion refusée. Google n'existait pas encore." },
  { url: "http://www.yahoo.fr", joke: "Vous avez 4 728 nouveaux e-mails non lus." },
  { url: "http://www.msn.com", joke: "MSN Messenger : vos 47 contacts sont hors ligne." },
  { url: "http://www.gunthcorp.net", joke: "404 — GunthCorp a déménagé. Adresse inconnue." },
  { url: "http://www.jeuxvideo.com", joke: "Page chargée à 34%. Abandon recommandé." },
];

export function IEApp() {
  const [url, setUrl] = useState("http://www.gunthcorp.net");
  const [inputUrl, setInputUrl] = useState("http://www.gunthcorp.net");
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [visitedSite, setVisitedSite] = useState<(typeof FAKE_SITES)[0] | null>(null);

  function navigate(target?: string) {
    const dest = target ?? inputUrl;
    setUrl(dest);
    setInputUrl(dest);
    setError(null);
    setVisitedSite(null);
    setLoading(true);
    setLoadProgress(0);

    const interval = setInterval(() => {
      setLoadProgress((p) => {
        const next = p + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setLoading(false);
          const known = FAKE_SITES.find((s) => dest.includes(new URL(s.url).hostname));
          if (known) {
            setVisitedSite(known);
          } else {
            setError(pickRandom(IE_ERRORS)!);
          }
          return 100;
        }
        return next;
      });
    }, 120);
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      {/* Toolbar */}
      <div
        className="flex gap-1 px-2 py-1 border-b shrink-0 items-center"
        style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}
      >
        {["◀", "▶", "🔄", "🏠"].map((btn) => (
          <button
            key={btn}
            className="w-7 h-7 border-[2px] text-sm flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: "var(--t-bg)",
              color: "var(--t-text)",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
            }}
            onClick={btn === "🏠" ? () => navigate("http://www.gunthcorp.net") : btn === "🔄" ? () => navigate() : undefined}
          >
            {btn}
          </button>
        ))}

        <input
          className="flex-1 px-2 py-0.5 text-sm border-[2px] outline-none mx-1"
          style={{
            backgroundColor: "var(--t-app-bg)",
            color: "var(--t-app-text)",
            fontFamily: "var(--t-font-mono)",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
          }}
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate()}
        />
        <button
          className="px-3 py-0.5 border-[2px] text-sm tracking-widest cursor-pointer"
          style={{
            backgroundColor: "var(--t-bg)",
            color: "var(--t-text)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
          onClick={() => navigate()}
        >
          OK
        </button>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="h-1 shrink-0" style={{ backgroundColor: "var(--t-bg-dark)" }}>
          <div
            className="h-full"
            style={{ width: `${loadProgress}%`, backgroundColor: "var(--t-accent)", transition: "width 0.1s" }}
          />
        </div>
      )}

      {/* Content area — theme-aware */}
      <div
        className="flex-1 flex items-center justify-center p-6 text-center"
        style={{ backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}
      >
        {loading ? (
          <div style={{ fontFamily: "var(--t-font-mono)", fontSize: "0.875rem", color: "var(--t-accent)" }}>
            Connexion à {url}…<br />
            <span style={{ fontSize: "0.75rem", color: "var(--t-text-muted)" }}>
              {Math.floor(loadProgress)}% chargé — ne cliquez pas ailleurs
            </span>
          </div>
        ) : error ? (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🚫</div>
            <div style={{ fontFamily: "var(--t-font-display)", fontSize: "1.1rem", fontWeight: "bold", color: "var(--t-accent)", marginBottom: 6 }}>
              Cette page ne peut pas être affichée
            </div>
            <div style={{ fontFamily: "var(--t-font-mono)", fontSize: "0.75rem", color: "var(--t-app-text-muted)", maxWidth: 280 }}>
              {error}
            </div>
            <div style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--t-text-subtle)" }}>
              Internet Explorer 6.0 — GunthOS Edition
            </div>
            <div className="flex gap-2 justify-center mt-4">
              {FAKE_SITES.slice(0, 3).map((s) => (
                <button
                  key={s.url}
                  onClick={() => navigate(s.url)}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--t-accent)",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--t-font-display)",
                  }}
                >
                  {new URL(s.url).hostname}
                </button>
              ))}
            </div>
          </div>
        ) : visitedSite ? (
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--t-accent)", fontFamily: "var(--t-font-display)", marginBottom: 8 }}>
              {visitedSite.url}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--t-app-text-muted)", fontFamily: "var(--t-font-display)", marginBottom: 16 }}>
              {visitedSite.joke}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--t-text-subtle)" }}>
              🔒 Ce site est certifié sécurisé par GunthCert™ (certificat expiré)
            </div>
          </div>
        ) : null}
      </div>

      {/* Status bar */}
      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between"
        style={{
          borderColor: "var(--t-border-dark)",
          color: "var(--t-text-muted)",
          backgroundColor: "var(--t-bg)",
        }}
      >
        <span>{loading ? `Connexion à ${url}…` : error ? "Erreur" : "Terminé"}</span>
        <span>🌐 Zone Internet</span>
      </div>
    </div>
  );
}
