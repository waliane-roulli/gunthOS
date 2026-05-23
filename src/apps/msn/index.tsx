"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useWindowActions } from "@/lib/contexts/window-manager-context";
import { useMessenger, type ChatAPI, type GroupChatAPI, type ChatEffect } from "@/lib/contexts/unread-context";
import { useChatWindows } from "@/lib/contexts/chat-windows-context";
import { useWindowState } from "@/lib/contexts/window-manager-context";
import { MsnLogo } from "@/components/ui/msn-logo";
import type { AppProps } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  statusMessage: string | null;
  avatarDataUrl: string | null;
  onlineStatus: "online" | "away" | "busy" | "offline";
}

interface GroupMember {
  userId: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  avatarDataUrl: string | null;
  onlineStatus: string | null;
}

interface Group {
  id: number;
  name: string;
  createdById: string;
  members: GroupMember[];
}

interface Message {
  id: number;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string | Date;
}

interface GroupMessage {
  id: number;
  groupId: number;
  fromUserId: string;
  fromName: string;
  content: string;
  createdAt: string | Date;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MSN_WINKS = [
  "🫨 NUDGE REÇU !",
  "🫨 Ton écran tremble !",
  "🫨 NUDGE x3 — Au secours",
  "🫨 Attention ! Nudge détecté !",
  "🫨 GunthMessenger™ confirme : tu te fais nudger",
  "🫨 ALERTE VIBRATION MAXIMALE",
];

const EASTER_EGGS: Array<{ triggers: RegExp; reaction: string; duration?: number }> = [
  { triggers: /\blol\b|\blmao\b|\bptdr\b|\bmdr\b/i, reaction: "😂 GunthMessenger™ a détecté un fou rire", duration: 3000 },
  { triggers: /\b<3\b|❤️|🧡|💛|💚|💙|💜/i, reaction: "💌 GunthMessenger™ rougit légèrement", duration: 3000 },
  { triggers: /\bnudge\b/i, reaction: "🫨 Tu parles de nudge ? Essaie le vrai bouton !", duration: 3000 },
  { triggers: /\bpizza\b|\bpizza🍕/i, reaction: "🍕 Commande pizza enregistrée (faux)", duration: 4000 },
  { triggers: /\bsalut\b|\bbonjour\b|\bhello\b|\bhey\b|\bcoucou\b/i, reaction: "👋 GunthMessenger™ dit aussi bonjour !", duration: 2500 },
  { triggers: /\bbye\b|\bauvoir\b|\bbonne nuit\b|\bà plus\b|\bciao\b/i, reaction: "😢 GunthMessenger™ est triste de te voir partir", duration: 3000 },
  { triggers: /\bamour\b|\bje t'aime\b|\bjtm\b/i, reaction: "💘 GunthMessenger™ a transmis le message au Dieu des amours", duration: 4000 },
  { triggers: /\bgunthos\b|\bgunth\b/i, reaction: "🖥️ GunthOS entend son nom…", duration: 3000 },
  { triggers: /\b404\b/i, reaction: "⚠️ Erreur 404 : blague introuvable", duration: 3000 },
  { triggers: /^!help$/i, reaction: "❓ Commandes : !pizza !vibe !bsod !matrix", duration: 4000 },
  { triggers: /^!pizza$/i, reaction: "🍕 Livraison estimée : 45 min (connexion 56K)", duration: 5000 },
  { triggers: /^!vibe$/i, reaction: "🎵 *GunthMessenger™ envoie des bonnes vibes*", duration: 4000 },
  { triggers: /^!bsod$/i, reaction: "💀 BSOD ÉVITÉ DE JUSTESSE — Redémarrage annulé", duration: 5000 },
  { triggers: /^!matrix$/i, reaction: "🟩 Tu as choisi la pilule rouge. Bienvenue dans GunthOS.", duration: 5000 },
];

function getEasterEgg(text: string): string | null {
  for (const egg of EASTER_EGGS) {
    if (egg.triggers.test(text)) return egg.reaction;
  }
  return null;
}

const TYPING_PHRASES = [
  "est en train d'écrire...",
  "réfléchit intensément...",
  "appuie sur des touches au hasard...",
  "compose un chef-d'œuvre...",
  "tape et efface. tape et efface.",
  "rédige un roman...",
  "cherche ses mots...",
  "tape avec ses coudes probablement...",
];

const MSN_EFFECT_BUTTONS: Array<{ effect: ChatEffect; emoji: string; label: string; title: string }> = [
  { effect: "confetti", emoji: "🎆", label: "Confetti", title: "Lancer des confettis chez l'autre !" },
  { effect: "heart",    emoji: "💌", label: "Love",     title: "Envoyer de l'amour" },
  { effect: "rain",     emoji: "🌧️", label: "Pluie",    title: "Faire pleuvoir sur l'autre" },
  { effect: "shake",    emoji: "🌋", label: "Tremble",  title: "Faire trembler sa fenêtre" },
  { effect: "matrix",   emoji: "🟩", label: "Matrix",   title: "Envoyer l'autre dans la Matrice" },
  { effect: "bsod",     emoji: "💀", label: "BSOD",     title: "Provoquer un faux BSOD" },
];

const MSN_AWAY_MESSAGES = [
  "Je défragmente. Reviens dans 4h.",
  "AFK — CD-ROM éjecté",
  "Connexion 56K instable",
  "En train de souffler dans ma cartouche",
  "Mise à jour Windows en cours (depuis 2003)",
  "Résolution du conflit IRQ entre la carte son et le modem 56K",
  "Partie de Solitaire en cours",
  "Flying Toasters en cours — Ne pas déranger avant le retour des toasters",
  "En vacances sur Geocities",
  "Occupé à ne pas éteindre correctement",
  "En train de composer un statut MSN de 17 mots exactement",
  "Photo de profil JPEG en cours de compression (qualité : 8)",
];

const MSN_EMOTICONS: Record<string, string> = {
  ":)": "😊", ":D": "😄", ":(": "😢", ";)": "😉", ":P": "😛",
  "XD": "😆", ":O": "😲", "B)": "😎", ":|": "😐", "O:)": "😇",
  ">:(": "😠", ":'(": "😭",
};

function replaceEmoticons(text: string): string {
  let result = text;
  for (const [code, emoji] of Object.entries(MSN_EMOTICONS)) {
    result = result.split(code).join(emoji);
  }
  return result;
}

function getRandomAwayMessage() {
  return MSN_AWAY_MESSAGES[Math.floor(Math.random() * MSN_AWAY_MESSAGES.length)];
}

const STATUS_ICONS: Record<Contact["onlineStatus"], string> = {
  online: "🟢", away: "🟡", busy: "🔴", offline: "⚫",
};

const STATUS_LABELS: Record<Contact["onlineStatus"], string> = {
  online: "En ligne", away: "Absent", busy: "Occupé", offline: "Hors ligne",
};

const PIXEL_AVATARS = ["👾", "🤖", "👻", "🦄", "🐱", "🐸", "🦊", "🐺", "🐻", "🦁", "🐼", "🐨", "🦝", "🐙", "🦋"];

function getDefaultAvatar(userId: string): string {
  const idx = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % PIXEL_AVATARS.length;
  return PIXEL_AVATARS[idx]!;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Avatar({ contact, size = 36 }: { contact: Pick<Contact, "avatarDataUrl" | "id" | "name">; size?: number }) {
  if (contact.avatarDataUrl) {
    return (
      <img src={contact.avatarDataUrl} alt={contact.name}
        style={{ width: size, height: size, objectFit: "cover", imageRendering: "pixelated", border: "2px solid var(--t-border-dark)" }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.55, background: "var(--t-bg-dark)", border: "2px solid var(--t-border-dark)", flexShrink: 0 }}>
      {getDefaultAvatar(contact.id)}
    </div>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div style={{ position: "absolute", top: -4, right: -4, background: "var(--t-accent)", color: "var(--t-titlebar-text)",
      borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: "bold",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--t-font-display)", border: "1px solid var(--t-border-light)", zIndex: 1 }}>
      {count > 9 ? "9+" : count}
    </div>
  );
}

// ── Effect overlays ───────────────────────────────────────────────────────────

function ConfettiOverlay({ fromName }: { fromName: string }) {
  const colors = ["#ff4444", "#ffbb33", "#00C851", "#33b5e5", "#ff69b4", "#aa66cc", "#ff8800"];
  const pieces = useRef(Array.from({ length: 40 }, (_, i) => ({
    left: Math.random() * 100, rounded: Math.random() > 0.5,
    dur: 1.5 + Math.random() * 2, delay: Math.random() * 1.5,
    rotate: Math.random() * 360, color: colors[i % colors.length]!,
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10 }}>
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", color: "#ff4444", fontWeight: "bold", zIndex: 11, animation: "blink 0.5s step-end infinite" }}>
        🎆 {fromName} t&apos;envoie des confettis !
      </div>
      {pieces.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: `${p.left}%`, top: "-10px", width: 8, height: 8,
          background: p.color, borderRadius: p.rounded ? "50%" : "0",
          animation: `confettiFall ${p.dur}s ${p.delay}s linear forwards`, transform: `rotate(${p.rotate}deg)` }} />
      ))}
      <style>{`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity:1; } 100% { transform: translateY(500px) rotate(720deg); opacity:0; } }`}</style>
    </div>
  );
}

function HeartOverlay({ fromName }: { fromName: string }) {
  const HEART_EMOJIS = ["❤️","💕","💖","💗","💓"] as const;
  const hearts = useRef(Array.from({ length: 20 }, (_, i) => ({
    left: 5 + Math.random() * 90, size: 14 + Math.random() * 20,
    dur: 2 + Math.random() * 2, delay: Math.random() * 1.5, emoji: HEART_EMOJIS[i % 5]!,
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10 }}>
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", color: "#ff69b4", fontWeight: "bold", zIndex: 11, animation: "blink 0.5s step-end infinite" }}>
        💌 {fromName} t&apos;envoie de l&apos;amour !
      </div>
      {hearts.map((h, i) => (
        <div key={i} style={{ position: "absolute", left: `${h.left}%`, bottom: "-10px", fontSize: `${h.size}px`,
          animation: `heartFloat ${h.dur}s ${h.delay}s ease-in forwards` }}>{h.emoji}</div>
      ))}
      <style>{`@keyframes heartFloat { 0% { transform:translateY(0) scale(.5); opacity:1; } 100% { transform:translateY(-520px) scale(1.2); opacity:0; } }`}</style>
    </div>
  );
}

function RainOverlay({ fromName }: { fromName: string }) {
  const drops = useRef(Array.from({ length: 60 }, () => ({
    left: Math.random() * 100, height: 10 + Math.random() * 14,
    dur: 0.4 + Math.random() * 0.4, delay: Math.random(),
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10, background: "rgba(0,50,120,0.08)" }}>
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", color: "#4488ff", fontWeight: "bold", zIndex: 11, animation: "blink 0.5s step-end infinite" }}>
        🌧️ {fromName} fait pleuvoir sur toi
      </div>
      {drops.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: `${d.left}%`, top: "-20px", width: 1.5, height: d.height,
          background: "rgba(100,160,255,0.7)", animation: `rainFall ${d.dur}s ${d.delay}s linear infinite` }} />
      ))}
      <style>{`@keyframes rainFall { 0% { transform:translateY(0); opacity:.8; } 100% { transform:translateY(520px); opacity:.2; } }`}</style>
    </div>
  );
}

function ShakeOverlay({ fromName }: { fromName: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", fontFamily: "var(--t-font-display)", zIndex: 11, padding: "8px 16px", background: "rgba(0,0,0,0.75)", color: "#ff4444", border: "3px solid #ff4444" }}>
        <div style={{ fontSize: "var(--t-text-sm)", fontWeight: "bold", animation: "blink 0.3s step-end infinite" }}>🌋 SÉISME NIVEAU 9</div>
        <div style={{ fontSize: "var(--t-text-xs)", marginTop: 4, color: "#fff" }}>{fromName} fait trembler GunthOS</div>
      </div>
    </div>
  );
}

function MatrixOverlay({ fromName }: { fromName: string }) {
  const chars = "アイウエオカキクケコ01010GUNTH10101ンソシ";
  const cols = useRef(Array.from({ length: 18 }, (_, i) => ({
    left: (i / 18) * 100, dur: 1 + Math.random() * 1.5, delay: Math.random(),
    text: Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10, background: "rgba(0,20,0,0.88)" }}>
      <div style={{ position: "absolute", top: "38%", left: 0, right: 0, textAlign: "center", zIndex: 12, fontFamily: "monospace" }}>
        <div style={{ color: "#00ff41", fontSize: "var(--t-text-md)", fontWeight: "bold", animation: "blink 0.4s step-end infinite" }}>WAKE UP, {fromName.toUpperCase()}</div>
        <div style={{ color: "#00cc33", fontSize: "var(--t-text-xs)", marginTop: 6 }}>GunthOS has you.</div>
      </div>
      {cols.map((col, i) => (
        <div key={i} style={{ position: "absolute", left: `${col.left}%`, top: 0, fontSize: 11, color: "#00ff41",
          fontFamily: "monospace", opacity: 0.7, animation: `matrixDrop ${col.dur}s ${col.delay}s linear infinite`,
          whiteSpace: "nowrap", writingMode: "vertical-lr", letterSpacing: 4 }}>{col.text}</div>
      ))}
      <style>{`@keyframes matrixDrop { 0% { transform:translateY(-100%); opacity:1; } 100% { transform:translateY(120%); opacity:0; } }`}</style>
    </div>
  );
}

function BsodOverlay({ fromName }: { fromName: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, background: "#0000AA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 20 }}>
      <div style={{ color: "#fff", fontFamily: "monospace", textAlign: "center", fontSize: 11, lineHeight: 1.8, userSelect: "none" }}>
        <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 12 }}>Windows</div>
        <div>A fatal exception 0xDEAD has occurred at</div>
        <div>0028:{fromName.toUpperCase().replace(/ /g, "_")}_BAD_POOL_CALLER</div>
        <div style={{ marginTop: 10 }}>The current application will be terminated.</div>
        <div style={{ marginTop: 16, animation: "blink 1s step-end infinite" }}>
          * Press any key to terminate the current application.<br />
          * Press CTRL+ALT+DELETE to restart GunthOS.
        </div>
        <div style={{ marginTop: 16, opacity: 0.7, fontSize: 10 }}>Envoyé par {fromName} avec amour 💀</div>
      </div>
    </div>
  );
}

function EffectOverlay({ effect, fromName }: { effect: ChatEffect; fromName: string }) {
  if (effect === "confetti") return <ConfettiOverlay fromName={fromName} />;
  if (effect === "heart")    return <HeartOverlay fromName={fromName} />;
  if (effect === "rain")     return <RainOverlay fromName={fromName} />;
  if (effect === "shake")    return <ShakeOverlay fromName={fromName} />;
  if (effect === "matrix")   return <MatrixOverlay fromName={fromName} />;
  if (effect === "bsod")     return <BsodOverlay fromName={fromName} />;
  return null;
}

// ── ChatWindow (DM) ───────────────────────────────────────────────────────────

export function ChatWindowContent({
  contact, myId, myAvatar, onClose,
}: {
  contact: Contact; myId: string; myAvatar: string | null;
  onClose: () => void;
}) {
  const { registerChat, unregisterChat, markRead } = useMessenger();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [nudgeActive, setNudgeActive] = useState(false);
  const [winkMsg, setWinkMsg] = useState<string | null>(null);
  const [typingPhrase, setTypingPhrase] = useState<string | null>(null);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<{ effect: ChatEffect; fromName: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentAt = useRef<number>(0);

  const triggerNudge = useCallback((fromName: string) => {
    const wink = MSN_WINKS[Math.floor(Math.random() * MSN_WINKS.length)] ?? MSN_WINKS[0]!;
    setWinkMsg(`${wink} — ${fromName}`);
    setNudgeActive(true);
    setTimeout(() => setNudgeActive(false), 600);
    setTimeout(() => setWinkMsg(null), 3000);
  }, []);

  const triggerEffect = useCallback((effect: ChatEffect, fromName: string) => {
    setActiveEffect({ effect, fromName });
    const duration = effect === "bsod" ? 6000 : effect === "matrix" ? 5000 : 4000;
    setTimeout(() => setActiveEffect(null), duration);
  }, []);

  const triggerTyping = useCallback(() => {
    const phrase = TYPING_PHRASES[Math.floor(Math.random() * TYPING_PHRASES.length)]!;
    setTypingPhrase(phrase);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTypingPhrase(null), 3000);
  }, []);

  useEffect(() => {
    const api: ChatAPI = {
      pushMessage(msg) {
        setMsgs(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        setTypingPhrase(null);
        markRead(contact.id);
      },
      triggerNudge, triggerTyping, triggerEffect,
    };
    registerChat(contact.id, api);
    markRead(contact.id);
    return () => { unregisterChat(contact.id); };
  }, [contact.id, registerChat, unregisterChat, markRead, triggerNudge, triggerTyping, triggerEffect]);

  useEffect(() => {
    fetch(`/api/messages?with=${contact.id}&since=0`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.messages) setMsgs(data.messages); });
  }, [contact.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    const now = Date.now();
    if (now - lastTypingSentAt.current > 2000 && e.target.value.trim()) {
      lastTypingSentAt.current = now;
      fetch("/api/messages/typing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: contact.id }) });
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);
    const egg = getEasterEgg(text);
    if (egg) { setEasterEgg(egg); setTimeout(() => setEasterEgg(null), 5000); }
    try {
      const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: contact.id, content: text }) });
      if (res.ok) {
        const data = await res.json();
        setMsgs(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]);
      }
    } finally { setIsSending(false); inputRef.current?.focus(); }
  }

  async function sendEffect(effect: ChatEffect) {
    setActiveEffect({ effect, fromName: "Toi" });
    setTimeout(() => setActiveEffect(null), effect === "bsod" ? 6000 : effect === "matrix" ? 5000 : 4000);
    await fetch("/api/messages/effect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: contact.id, effect }) });
  }

  async function sendNudge() {
    setWinkMsg("🫨 NUDGE ENVOYÉ !");
    setNudgeActive(true);
    setTimeout(() => setNudgeActive(false), 600);
    setTimeout(() => setWinkMsg(null), 3000);
    await fetch("/api/messages/nudge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId: contact.id }) });
  }

  const displayName = contact.displayUsername || contact.username || contact.name;

  return (
    <div className="flex flex-col" style={{ height: "100%", background: "var(--t-bg)", fontFamily: "var(--t-font-display)",
      animation: nudgeActive || activeEffect?.effect === "shake" ? "nudge 0.08s ease infinite" : "none",
      position: "relative", overflow: "hidden" }}>

      <div className="flex items-center gap-2 px-2 py-1 shrink-0"
        style={{ background: "var(--t-bg-light)", borderBottom: "2px solid var(--t-border-dark)" }}>
        <Avatar contact={contact} size={32} />
        <div className="flex flex-col min-w-0">
          <span className="font-bold tracking-widest truncate" style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>
            {STATUS_ICONS[contact.onlineStatus]} {displayName}
          </span>
          <span className="tracking-wider truncate" style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            {contact.statusMessage || STATUS_LABELS[contact.onlineStatus]}
          </span>
        </div>
        <button onClick={onClose}
          style={{ marginLeft: "auto", background: "var(--t-bg)", border: "2px solid",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
            width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontWeight: "bold", color: "var(--t-text)" }}>✕</button>
      </div>

      {activeEffect && <EffectOverlay effect={activeEffect.effect} fromName={activeEffect.fromName} />}

      {winkMsg && (
        <div className="text-center tracking-widest py-1 shrink-0"
          style={{ fontSize: "var(--t-text-xs)", background: "var(--t-accent)", color: "var(--t-titlebar-text)", animation: "blink 0.5s step-end infinite" }}>
          {winkMsg}
        </div>
      )}

      {easterEgg && (
        <div className="text-center tracking-widest py-1 shrink-0"
          style={{ fontSize: "var(--t-text-xs)", background: "#4a0080", color: "#fff", animation: "blink 0.4s step-end infinite" }}>
          {easterEgg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ background: "var(--t-app-bg)", color: "var(--t-text)", fontSize: "var(--t-text-sm)" }}>
        {msgs.length === 0 && (
          <div className="text-center tracking-wider mt-8 leading-relaxed" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)" }}>
            💬 Début de la conversation<br />
            <span style={{ fontSize: "var(--t-text-xs)", opacity: 0.7 }}>GunthMessenger™ v6.0 — Connexion 56K stable (pour l&apos;instant)</span>
          </div>
        )}
        {msgs.map((msg) => {
          const isMe = msg.fromUserId === myId;
          const text = replaceEmoticons(msg.content);
          const time = new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className="flex items-end gap-1">
                {!isMe && <div style={{ fontSize: 18 }}>{contact.avatarDataUrl ? <img src={contact.avatarDataUrl} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} /> : getDefaultAvatar(contact.id)}</div>}
                <div style={{ maxWidth: 280, padding: "4px 8px", fontSize: "var(--t-text-sm)", fontFamily: "var(--t-font-display)", lineHeight: 1.4, wordBreak: "break-word", border: "2px solid",
                  ...(isMe
                    ? { background: "var(--t-accent)", color: "var(--t-titlebar-text)", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", borderRadius: "4px 4px 0 4px" }
                    : { background: "var(--t-card-hover)", color: "var(--t-text)", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", borderRadius: "4px 4px 4px 0" }) }}>
                  {!isMe && <div style={{ fontWeight: "bold", fontSize: "var(--t-text-xs)", marginBottom: 2, color: "var(--t-accent)" }}>{displayName}</div>}
                  {text}
                </div>
                {isMe && <div style={{ fontSize: 18 }}>{myAvatar ? <img src={myAvatar} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} /> : getDefaultAvatar(myId)}</div>}
              </div>
              <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle)", marginTop: 1, paddingLeft: isMe ? 0 : 24, paddingRight: isMe ? 24 : 0 }}>{time}</div>
            </div>
          );
        })}
        {typingPhrase && (
          <div className="flex items-center gap-2" style={{ opacity: 0.7 }}>
            <div style={{ fontSize: 16 }}>{contact.avatarDataUrl ? <img src={contact.avatarDataUrl} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} /> : getDefaultAvatar(contact.id)}</div>
            <div style={{ padding: "3px 8px", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", border: "2px solid", fontStyle: "italic",
              borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
              background: "var(--t-card-hover)", color: "var(--t-text-muted)", borderRadius: "4px 4px 4px 0" }}>
              <span style={{ animation: "blink 1s step-end infinite" }}>⌨</span> {displayName} {typingPhrase}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-1 px-2 py-1 shrink-0"
        style={{ background: "var(--t-bg-light)", borderTop: "2px solid", borderTopColor: "var(--t-border-dark)", borderBottom: "1px solid var(--t-border-dark)" }}>
        {[":)", ":D", ":(", ";)", ":P", "XD"].map((code) => (
          <button key={code} onClick={() => setInput(v => v + code)} title={code}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1 }}>
            {MSN_EMOTICONS[code]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={sendNudge} title="Envoyer un nudge !"
          style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", fontSize: 11, padding: "1px 6px", fontFamily: "var(--t-font-display)", color: "var(--t-text)", letterSpacing: "0.1em" }}>
          🫨 Nudge
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 shrink-0"
        style={{ background: "var(--t-bg)", borderTop: "1px solid var(--t-border-dark)", borderBottom: "1px solid var(--t-border-dark)" }}>
        <span style={{ fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)", marginRight: 2, letterSpacing: "0.05em" }}>Effets :</span>
        {MSN_EFFECT_BUTTONS.map((btn) => (
          <button key={btn.effect} onClick={() => sendEffect(btn.effect)} title={btn.title}
            style={{ background: "var(--t-bg-light)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", fontSize: 10, padding: "1px 5px", fontFamily: "var(--t-font-display)", color: "var(--t-text)", display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 13 }}>{btn.emoji}</span>
            <span style={{ letterSpacing: "0.05em" }}>{btn.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-2 py-2 shrink-0"
        style={{ background: "var(--t-bg)", borderTop: "2px solid var(--t-border-light)" }}>
        <input ref={inputRef} value={input} onChange={handleInputChange}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Écrivez un message... (Entrée pour envoyer)" maxLength={500}
          style={{ flex: 1, padding: "3px 6px", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", border: "2px solid",
            borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
            background: "var(--t-app-bg)", color: "var(--t-text)", outline: "none" }}
        />
        <button onClick={send} disabled={isSending || !input.trim()}
          style={{ padding: "3px 12px", fontSize: 11, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", color: "var(--t-text)", border: "2px solid",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
            cursor: isSending || !input.trim() ? "not-allowed" : "pointer", opacity: !input.trim() ? 0.5 : 1, letterSpacing: "0.1em" }}>
          {isSending ? "..." : "Envoyer"}
        </button>
      </div>

      <style>{`@keyframes nudge { 0% { transform:translateX(-4px); } 50% { transform:translateX(4px); } 100% { transform:translateX(-4px); } }`}</style>
    </div>
  );
}

// ── GroupChatWindowContent ────────────────────────────────────────────────────

export function GroupChatWindowContent({
  group, myId, myAvatar, onClose,
}: {
  group: Group; myId: string; myAvatar: string | null;
  onClose: () => void;
}) {
  const { registerGroupChat, unregisterGroupChat, markGroupRead } = useMessenger();
  const [msgs, setMsgs] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingInfo, setTypingInfo] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentAt = useRef<number>(0);

  const triggerTyping = useCallback((fromName: string) => {
    setTypingInfo(`${fromName} écrit...`);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTypingInfo(null), 3000);
  }, []);

  useEffect(() => {
    const api: GroupChatAPI = {
      pushMessage(msg) {
        setMsgs(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        setTypingInfo(null);
        markGroupRead(group.id);
      },
      triggerTyping,
    };
    registerGroupChat(group.id, api);
    markGroupRead(group.id);
    return () => { unregisterGroupChat(group.id); };
  }, [group.id, registerGroupChat, unregisterGroupChat, markGroupRead, triggerTyping]);

  useEffect(() => {
    fetch(`/api/groups/messages?groupId=${group.id}&since=0`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.messages) setMsgs(data.messages); });
  }, [group.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    const now = Date.now();
    if (now - lastTypingSentAt.current > 2000 && e.target.value.trim()) {
      lastTypingSentAt.current = now;
      fetch("/api/groups/typing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId: group.id }) });
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);
    try {
      const res = await fetch("/api/groups/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId: group.id, content: text }) });
      if (res.ok) {
        const data = await res.json();
        const me = group.members.find(m => m.userId === myId);
        const newMsg: GroupMessage = {
          id: data.message.id,
          groupId: group.id,
          fromUserId: myId,
          fromName: me?.name ?? "Moi",
          content: data.message.content,
          createdAt: data.message.createdAt,
        };
        setMsgs(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      }
    } finally { setIsSending(false); inputRef.current?.focus(); }
  }

  const memberNames = group.members
    .filter(m => m.userId !== myId)
    .map(m => m.displayUsername || m.username || m.name)
    .join(", ");

  return (
    <div className="flex flex-col" style={{ height: "100%", background: "var(--t-bg)", fontFamily: "var(--t-font-display)", position: "relative", overflow: "hidden" }}>

      <div className="flex items-center gap-2 px-2 py-1 shrink-0"
        style={{ background: "var(--t-bg-light)", borderBottom: "2px solid var(--t-border-dark)" }}>
        <div style={{ fontSize: 24, lineHeight: 1 }}>👥</div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-bold tracking-widest truncate" style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>
            {group.name}
          </span>
          <span className="tracking-wider truncate" style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            {group.members.length} membres · {memberNames || "vous seulement"}
          </span>
        </div>
        <button onClick={onClose}
          style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold", color: "var(--t-text)" }}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ background: "var(--t-app-bg)", color: "var(--t-text)" }}>
        {msgs.length === 0 && (
          <div className="text-center tracking-wider mt-8 leading-relaxed" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)" }}>
            👥 Bienvenue dans <strong>{group.name}</strong> !<br />
            <span style={{ opacity: 0.7 }}>{group.members.length} membres connectés</span>
          </div>
        )}
        {msgs.map(msg => {
          const isMe = msg.fromUserId === myId;
          const member = group.members.find(m => m.userId === msg.fromUserId);
          const text = replaceEmoticons(msg.content);
          const time = new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
          const senderName = member ? (member.displayUsername || member.username || member.name) : msg.fromName;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className="flex items-end gap-1">
                {!isMe && (
                  <div style={{ fontSize: 18 }}>
                    {member?.avatarDataUrl
                      ? <img src={member.avatarDataUrl} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} />
                      : getDefaultAvatar(msg.fromUserId)}
                  </div>
                )}
                <div style={{ maxWidth: 300, padding: "4px 8px", fontSize: "var(--t-text-sm)", fontFamily: "var(--t-font-display)", lineHeight: 1.4, wordBreak: "break-word", border: "2px solid",
                  ...(isMe
                    ? { background: "var(--t-accent)", color: "var(--t-titlebar-text)", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", borderRadius: "4px 4px 0 4px" }
                    : { background: "var(--t-card-hover)", color: "var(--t-text)", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", borderRadius: "4px 4px 4px 0" }) }}>
                  {!isMe && <div style={{ fontWeight: "bold", fontSize: "var(--t-text-xs)", marginBottom: 2, color: "var(--t-accent)" }}>{senderName}</div>}
                  {text}
                </div>
                {isMe && <div style={{ fontSize: 18 }}>{myAvatar ? <img src={myAvatar} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} /> : getDefaultAvatar(myId)}</div>}
              </div>
              <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle)", marginTop: 1, paddingLeft: isMe ? 0 : 24, paddingRight: isMe ? 24 : 0 }}>{time}</div>
            </div>
          );
        })}
        {typingInfo && (
          <div style={{ opacity: 0.7, fontSize: "var(--t-text-xs)", fontStyle: "italic", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
            <span style={{ animation: "blink 1s step-end infinite" }}>⌨</span> {typingInfo}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 px-2 py-2 shrink-0"
        style={{ background: "var(--t-bg)", borderTop: "2px solid var(--t-border-light)" }}>
        <input ref={inputRef} value={input} onChange={handleInputChange}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={`Message dans ${group.name}...`} maxLength={500}
          style={{ flex: 1, padding: "3px 6px", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", border: "2px solid",
            borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
            background: "var(--t-app-bg)", color: "var(--t-text)", outline: "none" }}
        />
        <button onClick={send} disabled={isSending || !input.trim()}
          style={{ padding: "3px 12px", fontSize: 11, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", color: "var(--t-text)", border: "2px solid",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
            cursor: isSending || !input.trim() ? "not-allowed" : "pointer", opacity: !input.trim() ? 0.5 : 1, letterSpacing: "0.1em" }}>
          {isSending ? "..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}

// ── CreateGroupModal ───────────────────────────────────────────────────────────

function CreateGroupModal({ contacts, myId, onClose, onCreate }: {
  contacts: Contact[]; myId: string;
  onClose: () => void;
  onCreate: (group: Group) => void;
}) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  function toggleContact(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim() || selected.size === 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), memberIds: Array.from(selected) }),
      });
      if (res.ok) {
        const data = await res.json();
        onCreate(data.group);
        onClose();
      }
    } finally { setCreating(false); }
  }

  const onlineContacts = contacts.filter(c => c.onlineStatus !== "offline");
  const offlineContacts = contacts.filter(c => c.onlineStatus === "offline");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380, background: "var(--t-bg)", fontFamily: "var(--t-font-display)", border: "3px solid",
        borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
        boxShadow: "4px 4px 0 rgba(0,0,0,0.3)" }}>

        <div className="flex items-center justify-between px-3 py-1"
          style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)" }}>
          <span style={{ fontSize: "var(--t-text-xs)", fontWeight: "bold", letterSpacing: "0.1em" }}>👥 Nouveau groupe</span>
          <button onClick={onClose}
            style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold", color: "var(--t-text)" }}>✕</button>
        </div>

        <div className="p-3 flex flex-col gap-3">
          <div>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 4, letterSpacing: "0.08em" }}>Nom du groupe</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Les Gunthers"
              maxLength={50} autoFocus
              style={{ width: "100%", padding: "3px 6px", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", border: "2px solid",
                borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
                background: "var(--t-app-bg)", color: "var(--t-text)", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", marginBottom: 4, letterSpacing: "0.08em" }}>
              Membres ({selected.size} sélectionné{selected.size > 1 ? "s" : ""})
            </div>
            <div style={{ maxHeight: 240, overflowY: "auto", border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", background: "var(--t-app-bg)" }}>
              {[...onlineContacts, ...offlineContacts].filter(c => c.id !== myId).map(contact => {
                const dname = contact.displayUsername || contact.username || contact.name;
                const isSelected = selected.has(contact.id);
                return (
                  <div key={contact.id} onClick={() => toggleContact(contact.id)}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                    style={{ background: isSelected ? "var(--t-card-hover)" : "transparent", borderBottom: "1px solid var(--t-border-dark)" }}>
                    <div style={{ width: 14, height: 14, border: "2px solid", borderTopColor: isSelected ? "var(--t-border-dark)" : "var(--t-border-light)", borderLeftColor: isSelected ? "var(--t-border-dark)" : "var(--t-border-light)", borderBottomColor: isSelected ? "var(--t-border-light)" : "var(--t-border-dark)", borderRightColor: isSelected ? "var(--t-border-light)" : "var(--t-border-dark)", background: isSelected ? "var(--t-accent)" : "var(--t-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isSelected && <span style={{ color: "var(--t-titlebar-text)", fontSize: 10, fontWeight: "bold" }}>✓</span>}
                    </div>
                    <Avatar contact={contact} size={24} />
                    <div className="flex flex-col min-w-0">
                      <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text)", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {STATUS_ICONS[contact.onlineStatus]} {dname}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={onClose}
              style={{ padding: "3px 12px", fontSize: 11, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", color: "var(--t-text)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", letterSpacing: "0.1em" }}>
              Annuler
            </button>
            <button onClick={handleCreate} disabled={!name.trim() || selected.size === 0 || creating}
              style={{ padding: "3px 12px", fontSize: 11, fontFamily: "var(--t-font-display)", background: "var(--t-accent)", color: "var(--t-titlebar-text)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: !name.trim() || selected.size === 0 ? "not-allowed" : "pointer", opacity: !name.trim() || selected.size === 0 ? 0.5 : 1, letterSpacing: "0.1em" }}>
              {creating ? "Création..." : "✓ Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper : position aléatoire intelligente ──────────────────────────────────

function findFreePosition(existingPositions: Array<{ x: number; y: number }>, w = 480, h = 520): { x: number; y: number } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const taskbarH = 44;
  const margin = 16;

  const maxX = Math.max(margin, vw - w - margin);
  const maxY = Math.max(60 + margin, vh - h - taskbarH - margin);

  for (let attempt = 0; attempt < 20; attempt++) {
    const x = margin + Math.floor(Math.random() * (maxX - margin));
    const y = 60 + margin + Math.floor(Math.random() * (maxY - 60 - margin));

    const overlaps = existingPositions.some(p => Math.abs(p.x - x) < 120 && Math.abs(p.y - y) < 80);
    if (!overlaps) return { x, y };
  }

  // Cascade fallback si tout est pris
  const idx = existingPositions.length;
  return {
    x: Math.min(margin + idx * 40, maxX),
    y: Math.min(60 + margin + idx * 40, maxY),
  };
}

// ── MsnApp ────────────────────────────────────────────────────────────────────

export function MsnApp(_: AppProps) {
  const { user } = useAuth();
  const { openWindow, closeWindow } = useWindowActions();
  const { windows } = useWindowState();
  const { registerChatSlug, unregisterChatSlug } = useChatWindows();
  const { totalUnread, unreadCounts, groupUnreadCounts, onNudgeOpen, onStatusUpdate } = useMessenger();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChatIds, setOpenChatIds] = useState<Record<string, string>>({});   // contactId → windowId
  const [openGroupIds, setOpenGroupIds] = useState<Record<number, string>>({});  // groupId → windowId
  const [myStatus, setMyStatus] = useState<Contact["onlineStatus"]>("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [myAwayMsg] = useState(() => getRandomAwayMessage());
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState<"contacts" | "groups">("contacts");

  // Track positions by slug for correct removal on close
  const chatPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Sync when windows are closed externally (titlebar ✕, taskbar close, etc.)
  useEffect(() => {
    const activeSlugs = new Set(windows.map(w => w.appSlug));
    setOpenChatIds(prev => {
      const next = { ...prev };
      let changed = false;
      for (const [contactId] of Object.entries(prev)) {
        if (!activeSlugs.has(`chat:${contactId}`)) {
          delete next[contactId];
          unregisterChatSlug(`chat:${contactId}`);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    setOpenGroupIds(prev => {
      const next = { ...prev };
      let changed = false;
      for (const [groupIdStr] of Object.entries(prev)) {
        if (!activeSlugs.has(`group:${groupIdStr}`)) {
          delete next[Number(groupIdStr)];
          unregisterChatSlug(`group:${groupIdStr}`);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [windows, unregisterChatSlug]);

  useEffect(() => {
    const order: Contact["onlineStatus"][] = ["online", "away", "busy", "offline"];
    onStatusUpdate.current = (userId, status) => {
      setContacts(prev => {
        const updated = prev.map(c => c.id === userId ? { ...c, onlineStatus: status } : c);
        return [...updated].sort((a, b) => order.indexOf(a.onlineStatus) - order.indexOf(b.onlineStatus));
      });
    };
    return () => { onStatusUpdate.current = null; };
  }, [onStatusUpdate]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/me").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.profile?.avatarDataUrl) setMyAvatar(data.profile.avatarDataUrl);
      if (data?.profile?.onlineStatus) setMyStatus(data.profile.onlineStatus);
    });
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [contactsRes, groupsRes] = await Promise.all([
      fetch("/api/profiles/list"),
      fetch("/api/groups"),
    ]);
    if (contactsRes.ok) {
      const data = await contactsRes.json();
      const all: Contact[] = (data.users || [])
        .filter((u: { username?: string | null }) => u.username !== user.username)
        .map((u: { id: string; name: string; username: string | null; displayUsername?: string | null; statusMessage?: string | null; avatarDataUrl?: string | null; onlineStatus?: string | null }) => ({
          ...u, onlineStatus: (u.onlineStatus as Contact["onlineStatus"]) ?? "offline",
        }));
      const order: Contact["onlineStatus"][] = ["online", "away", "busy", "offline"];
      all.sort((a, b) => order.indexOf(a.onlineStatus) - order.indexOf(b.onlineStatus));
      setContacts(all);
    }
    if (groupsRes.ok) {
      const data = await groupsRes.json();
      setGroups(data.groups || []);
    }
    setLoading(false);
    setLastSync(new Date());
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleStatusChange(newStatus: Contact["onlineStatus"]) {
    setMyStatus(newStatus);
    await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onlineStatus: newStatus }) });
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }

  const openChatWindow = useCallback((contactId: string) => {
    if (openChatIds[contactId]) {
      openWindow(`chat:${contactId}`, "", "💬");
      return;
    }
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || !user) return;

    const slug = `chat:${contactId}`;
    const pos = findFreePosition(Array.from(chatPositions.current.values()));
    chatPositions.current.set(slug, pos);

    const displayName = contact.displayUsername || contact.username || contact.name;
    const winId = openWindow(slug, `💬 ${displayName}`, "💬", { defaultSize: { w: 480, h: 520 } });

    registerChatSlug(slug, { kind: "dm", contact });
    setOpenChatIds(prev => ({ ...prev, [contactId]: winId }));
  }, [openChatIds, contacts, openWindow, registerChatSlug, user]);

  useEffect(() => {
    onNudgeOpen.current = openChatWindow;
    return () => { onNudgeOpen.current = null; };
  }, [onNudgeOpen, openChatWindow]);

  function closeChatWindow(contactId: string) {
    const winId = openChatIds[contactId];
    if (winId) closeWindow(winId);
    unregisterChatSlug(`chat:${contactId}`);
    setOpenChatIds(prev => { const next = { ...prev }; delete next[contactId]; return next; });
    chatPositions.current.delete(`chat:${contactId}`);
  }

  function openGroupWindow(group: Group) {
    const existingWinId = openGroupIds[group.id];
    if (existingWinId) {
      openWindow(`group:${group.id}`, "", "👥"); // focuses existing
      return;
    }

    const slug = `group:${group.id}`;
    chatPositions.current.set(slug, findFreePosition(Array.from(chatPositions.current.values())));

    const winId = openWindow(slug, `👥 ${group.name}`, "👥", { defaultSize: { w: 500, h: 520 } });

    registerChatSlug(slug, { kind: "group", group });
    setOpenGroupIds(prev => ({ ...prev, [group.id]: winId }));
  }

  function closeGroupWindow(groupId: number) {
    const winId = openGroupIds[groupId];
    if (winId) closeWindow(winId);
    unregisterChatSlug(`group:${groupId}`);
    setOpenGroupIds(prev => { const next = { ...prev }; delete next[groupId]; return next; });
    chatPositions.current.delete(`group:${groupId}`);
  }

  function toggleChat(contact: Contact) {
    if (openChatIds[contact.id]) {
      closeChatWindow(contact.id);
    } else {
      openChatWindow(contact.id);
    }
  }

  function toggleGroup(group: Group) {
    if (openGroupIds[group.id]) {
      closeGroupWindow(group.id);
    } else {
      openGroupWindow(group);
    }
  }

  function openProfile(username: string | null) {
    if (!username) return;
    openWindow(`profile:${username}`, username, "👤");
  }

  function handleGroupCreated(group: Group) {
    setGroups(prev => [...prev, group]);
    openGroupWindow(group);
  }

  const filtered = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (c.displayUsername || c.username || c.name).toLowerCase().includes(q);
  });

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col" style={{ height: "100%", minHeight: 480, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", position: "relative" }}>

      {/* Header */}
      <div className="shrink-0 px-3 py-2" style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)" }}>
        <div className="flex items-center gap-3">
          <MsnLogo size={40} />
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: "var(--t-font-display)", fontWeight: "bold", fontSize: "var(--t-text-sm)", letterSpacing: "0.1em" }}>GunthMessenger™</div>
            <div style={{ fontSize: "var(--t-text-xs)", opacity: 0.85 }}>v6.0 — Temps réel activé ⚡</div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 22 }}>{STATUS_ICONS[myStatus]}</div>
            {totalUnread > 0 && (
              <div style={{ position: "absolute", top: -4, right: -4, background: "var(--t-accent)", color: "var(--t-titlebar-text)", borderRadius: "50%", width: 14, height: 14, fontSize: 8, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--t-font-display)", border: "1px solid var(--t-border-light)" }}>
                {totalUnread > 9 ? "9+" : totalUnread}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 p-2" style={{ background: "rgba(0,0,0,0.15)", border: "1px solid", borderColor: "var(--t-border-light)" }}>
          <div style={{ flexShrink: 0 }}>
            {myAvatar
              ? <img src={myAvatar} alt="moi" style={{ width: 36, height: 36, objectFit: "cover", border: "2px solid var(--t-border-light)" }} />
              : <div style={{ fontSize: 28, lineHeight: 1 }}>{user ? getDefaultAvatar(user.id) : "👤"}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontWeight: "bold", fontSize: "var(--t-text-xs)", color: "var(--t-titlebar-text)" }}>{user?.name || "Moi"}</div>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-titlebar-text)", fontStyle: "italic", opacity: 0.8 }}>{myAwayMsg}</div>
          </div>
          <select value={myStatus} onChange={e => handleStatusChange(e.target.value as Contact["onlineStatus"])}
            style={{ fontSize: "var(--t-text-xs)", background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", color: "var(--t-text)", cursor: "pointer", fontFamily: "var(--t-font-display)", padding: "1px 2px" }}>
            <option value="online">🟢 En ligne</option>
            <option value="away">🟡 Absent</option>
            <option value="busy">🔴 Occupé</option>
            <option value="offline">⚫ Invisible</option>
          </select>
        </div>
      </div>

      {/* Search + tabs */}
      <div className="shrink-0 px-2 py-1 flex items-center gap-1" style={{ background: "var(--t-bg-light)", borderBottom: "2px solid var(--t-border-dark)" }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 Rechercher..."
          style={{ flex: 1, padding: "2px 6px", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", background: "var(--t-app-bg)", color: "var(--t-text)", border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", outline: "none" }}
        />
        <button onClick={handleRefresh} disabled={isRefreshing} title="Actualiser"
          style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: isRefreshing ? "wait" : "pointer", fontSize: 12, padding: "1px 5px", lineHeight: 1.4, animation: isRefreshing ? "spin 0.8s linear infinite" : "none", display: "inline-flex", alignItems: "center" }}>
          🔄
        </button>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex" style={{ borderBottom: "2px solid var(--t-border-dark)" }}>
        {(["contacts", "groups"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: "3px 0", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", letterSpacing: "0.08em", cursor: "pointer", border: "none", background: activeTab === tab ? "var(--t-bg)" : "var(--t-bg-light)", color: activeTab === tab ? "var(--t-text)" : "var(--t-text-muted)", borderBottom: activeTab === tab ? "2px solid var(--t-bg)" : "none", fontWeight: activeTab === tab ? "bold" : "normal", marginBottom: activeTab === tab ? -2 : 0 }}>
            {tab === "contacts" ? `💬 Contacts (${contacts.length})` : `👥 Groupes (${groups.length})`}
          </button>
        ))}
      </div>

      {lastSync && (
        <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)", textAlign: "right", padding: "1px 8px", background: "var(--t-bg-light)", borderBottom: "1px solid var(--t-border-dark)" }}>
          ⏱ {lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!user ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ color: "var(--t-text-muted)" }}>
            <div style={{ fontSize: 48 }}>🔒</div>
            <div style={{ fontSize: "var(--t-text-sm)", letterSpacing: "0.1em" }}>Connexion requise</div>
            <button onClick={() => openWindow("login", "Connexion GunthOS", "🔑")}
              style={{ padding: "4px 16px", fontSize: 11, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", color: "var(--t-text)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", letterSpacing: "0.1em" }}>
              🔑 Se connecter
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6" style={{ color: "var(--t-text-muted)" }}>
            <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>⌛</div>
            <div style={{ fontSize: "var(--t-text-xs)", letterSpacing: "0.1em" }}>Chargement...</div>
          </div>
        ) : activeTab === "contacts" ? (
          filtered.length === 0 ? (
            <div className="p-4 text-center" style={{ color: "var(--t-text-muted)" }}>
              <div style={{ fontSize: 32 }}>🦗</div>
              <div style={{ fontSize: "var(--t-text-xs)", letterSpacing: "0.1em", marginTop: 8 }}>Aucun contact trouvé</div>
            </div>
          ) : (
            <>
              {renderContactGroup("En ligne", filtered.filter(c => c.onlineStatus === "online"), openChatIds, unreadCounts, toggleChat, openProfile)}
              {renderContactGroup("Absent / Occupé", filtered.filter(c => c.onlineStatus === "away" || c.onlineStatus === "busy"), openChatIds, unreadCounts, toggleChat, openProfile)}
              {renderContactGroup("Hors ligne", filtered.filter(c => c.onlineStatus === "offline"), openChatIds, unreadCounts, toggleChat, openProfile)}
            </>
          )
        ) : (
          // Groups tab
          <div>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid var(--t-border-dark)" }}>
              <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", letterSpacing: "0.08em" }}>
                {filteredGroups.length} groupe{filteredGroups.length !== 1 ? "s" : ""}
              </span>
              <button onClick={() => setShowCreateGroup(true)}
                style={{ padding: "2px 10px", fontSize: 10, fontFamily: "var(--t-font-display)", background: "var(--t-accent)", color: "var(--t-titlebar-text)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", letterSpacing: "0.08em" }}>
                + Nouveau groupe
              </button>
            </div>
            {filteredGroups.length === 0 ? (
              <div className="p-6 text-center" style={{ color: "var(--t-text-muted)" }}>
                <div style={{ fontSize: 40 }}>👥</div>
                <div style={{ fontSize: "var(--t-text-xs)", marginTop: 8, letterSpacing: "0.08em" }}>Aucun groupe</div>
                <div style={{ fontSize: "var(--t-text-xs)", marginTop: 4, color: "var(--t-text-subtle)" }}>Créez un groupe pour chatter à plusieurs !</div>
              </div>
            ) : filteredGroups.map(group => {
              const unread = groupUnreadCounts[group.id] ?? 0;
              const isOpen = !!openGroupIds[group.id];
              const memberNames = group.members.slice(0, 3).map(m => m.displayUsername || m.username || m.name).join(", ");
              return (
                <div key={group.id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                  style={{ borderBottom: "1px solid var(--t-border-dark)", background: isOpen ? "var(--t-card-hover)" : "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--t-card-hover)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isOpen ? "var(--t-card-hover)" : "transparent"; }}
                  onClick={() => toggleGroup(group)}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "var(--t-bg-dark)", border: "2px solid var(--t-border-dark)" }}>👥</div>
                    {unread > 0 && <UnreadBadge count={unread} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "var(--t-text-xs)", fontWeight: unread > 0 ? "bold" : undefined, color: unread > 0 ? "var(--t-accent)" : "var(--t-text)", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {unread > 0 && "● "}{group.name}
                    </div>
                    <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {group.members.length} membres · {memberNames}{group.members.length > 3 ? "..." : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-3 py-1 flex items-center justify-between"
        style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", opacity: 0.85 }}>
        <span>GunthMessenger™ 2003 Edition</span>
        <span>© Gunth Corp.</span>
      </div>

      {showCreateGroup && user && (
        <CreateGroupModal
          contacts={contacts}
          myId={user.id}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleGroupCreated}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes badgePop { 0% { transform: scale(0.5); } 100% { transform: scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function renderContactGroup(
  label: string, contacts: Contact[],
  openChatIds: Record<string, string>, unreadCounts: Record<string, number>,
  toggleChat: (c: Contact) => void, openProfile: (username: string | null) => void,
) {
  if (contacts.length === 0) return null;
  return (
    <div key={label}>
      <div className="flex items-center gap-1 px-2 py-1 select-none"
        style={{ background: "var(--t-bg-dark)", borderBottom: "1px solid var(--t-border-dark)", borderTop: "1px solid var(--t-border-light)", fontSize: 11, color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", letterSpacing: "0.08em" }}>
        <span>▸</span><span>{label}</span><span style={{ opacity: 0.6 }}>({contacts.length})</span>
      </div>
      {contacts.map(contact => {
        const displayName = contact.displayUsername || contact.username || contact.name;
        const isOpen = !!openChatIds[contact.id];
        const unread = unreadCounts[contact.id] ?? 0;
        return (
          <div key={contact.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer group"
            style={{ borderBottom: "1px solid var(--t-border-dark)", background: isOpen ? "var(--t-card-hover)" : "transparent", transition: "background 0.1s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--t-card-hover)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isOpen ? "var(--t-card-hover)" : "transparent"; }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar contact={contact} size={32} />
              <div style={{ position: "absolute", bottom: -2, right: -2, fontSize: 10, lineHeight: 1 }}>{STATUS_ICONS[contact.onlineStatus]}</div>
              <UnreadBadge count={unread} />
            </div>
            <div className="flex-1 min-w-0" onClick={() => toggleChat(contact)}>
              <div style={{ fontSize: "var(--t-text-xs)", fontWeight: unread > 0 ? "bold" : undefined, letterSpacing: "0.08em", color: unread > 0 ? "var(--t-accent)" : "var(--t-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {unread > 0 && "● "}{displayName}
              </div>
              <div style={{ fontSize: "var(--t-text-xs)", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--t-text-muted)", fontStyle: "italic" }}>
                {contact.statusMessage || STATUS_LABELS[contact.onlineStatus]}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100" style={{ transition: "opacity 0.1s" }}>
              <button onClick={e => { e.stopPropagation(); toggleChat(contact); }} title="Envoyer un message"
                style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", fontSize: 12, padding: "1px 4px", position: "relative" }}>💬</button>
              <button onClick={e => { e.stopPropagation(); openProfile(contact.username); }} title="Voir le profil"
                style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", fontSize: 12, padding: "1px 4px" }}>👤</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
