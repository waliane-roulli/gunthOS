"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useWindowActions } from "@/lib/contexts/window-manager-context";
import { useMessenger, type ChatAPI } from "@/lib/contexts/unread-context";
import { useSSE } from "@/lib/hooks/use-sse";
import { MsnLogo } from "@/components/ui/msn-logo";
import type { AppProps } from "@/types";
import type { SSEEvent } from "@/lib/sse-bus";

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

interface Message {
  id: number;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string | Date;
}

const MSN_WINKS = [
  "🫨 NUDGE REÇU !",
  "🫨 Ton écran tremble !",
  "🫨 NUDGE x3 — Au secours",
];

const MSN_AWAY_MESSAGES = [
  "Je défragmente. Reviens dans 4h.",
  "AFK — CD-ROM éjecté",
  "Connexion 56K instable",
  "En train de souffler dans ma cartouche",
  "Mise à jour Windows en cours (depuis 2003)",
  "Je cherche mes drivers audio",
  "Partie de Solitaire en cours",
  "Écran de veille activé",
  "En vacances sur Geocities",
  "Occupé à ne pas éteindre correctement",
];

const MSN_EMOTICONS: Record<string, string> = {
  ":)": "😊",
  ":D": "😄",
  ":(": "😢",
  ";)": "😉",
  ":P": "😛",
  "XD": "😆",
  ":O": "😲",
  "B)": "😎",
  ":|": "😐",
  "O:)": "😇",
  ">:(": "😠",
  ":'(": "😭",
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
  online: "🟢",
  away: "🟡",
  busy: "🔴",
  offline: "⚫",
};

const STATUS_LABELS: Record<Contact["onlineStatus"], string> = {
  online: "En ligne",
  away: "Absent",
  busy: "Occupé",
  offline: "Hors ligne",
};

const PIXEL_AVATARS = ["👾", "🤖", "👻", "🦄", "🐱", "🐸", "🦊", "🐺", "🐻", "🦁", "🐼", "🐨", "🦝", "🐙", "🦋"];

function getDefaultAvatar(userId: string): string {
  const idx = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % PIXEL_AVATARS.length;
  return PIXEL_AVATARS[idx]!;
}

function Avatar({ contact, size = 36 }: { contact: Pick<Contact, "avatarDataUrl" | "id" | "name">; size?: number }) {
  if (contact.avatarDataUrl) {
    return (
      <img
        src={contact.avatarDataUrl}
        alt={contact.name}
        style={{ width: size, height: size, objectFit: "cover", imageRendering: "pixelated", border: "2px solid var(--t-border-dark)" }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.55,
        background: "var(--t-bg-dark)",
        border: "2px solid var(--t-border-dark)",
        flexShrink: 0,
      }}
    >
      {getDefaultAvatar(contact.id)}
    </div>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div
      style={{
        position: "absolute", top: -4, right: -4,
        background: "var(--t-accent)", color: "var(--t-titlebar-text)",
        borderRadius: "50%", width: 16, height: 16,
        fontSize: 9, fontWeight: "bold",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--t-font-display)", border: "1px solid var(--t-border-light)",
        zIndex: 1, animation: "badgePop 0.2s ease",
      }}
    >
      {count > 9 ? "9+" : count}
    </div>
  );
}

// ── ChatWindow ─────────────────────────────────────────────────────────────────

function ChatWindow({
  contact, myId, myAvatar, onClose, onDragStart,
}: {
  contact: Contact; myId: string; myAvatar: string | null;
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}) {
  const { registerChat, unregisterChat, markRead } = useMessenger();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [nudgeActive, setNudgeActive] = useState(false);
  const [winkMsg, setWinkMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerNudge = useCallback((fromName: string) => {
    const wink = MSN_WINKS[Math.floor(Math.random() * MSN_WINKS.length)] ?? MSN_WINKS[0]!;
    setWinkMsg(`${wink} — ${fromName}`);
    setNudgeActive(true);
    setTimeout(() => setNudgeActive(false), 600);
    setTimeout(() => setWinkMsg(null), 3000);
  }, []);

  // Register this window's API globally so SSE can reach it
  useEffect(() => {
    const api: ChatAPI = {
      pushMessage(msg) {
        setMsgs(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        markRead(contact.id);
      },
      triggerNudge,
    };
    registerChat(contact.id, api);
    markRead(contact.id);
    return () => { unregisterChat(contact.id); };
  }, [contact.id, registerChat, unregisterChat, markRead, triggerNudge]);

  // Load history once on open
  useEffect(() => {
    fetch(`/api/messages?with=${contact.id}&since=0`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.messages) setMsgs(data.messages); });
  }, [contact.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: contact.id, content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMsgs(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]);
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  async function sendNudge() {
    setWinkMsg("🫨 NUDGE ENVOYÉ !");
    setNudgeActive(true);
    setTimeout(() => setNudgeActive(false), 600);
    setTimeout(() => setWinkMsg(null), 3000);
    await fetch("/api/messages/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: contact.id }),
    });
  }

  const displayName = contact.displayUsername || contact.username || contact.name;

  return (
    <div
      className="flex flex-col"
      style={{
        width: 460, height: 480,
        background: "var(--t-bg)", fontFamily: "var(--t-font-display)",
        border: "3px solid",
        borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
        animation: nudgeActive ? "nudge 0.1s ease infinite" : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between px-2 py-1 shrink-0"
        onMouseDown={onDragStart}
        style={{
          background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
          color: "var(--t-titlebar-text)",
          cursor: onDragStart ? "move" : "default",
          userSelect: "none",
        }}
      >
        <div className="flex items-center gap-2 tracking-widest font-bold truncate" style={{ fontSize: "var(--t-text-xs)" }}>
          <span>💬</span>
          <span className="truncate">Conversation — {displayName}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "var(--t-bg)", border: "2px solid",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
            width: 18, height: 18, fontSize: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontWeight: "bold", color: "var(--t-text)", flexShrink: 0,
          }}
        >✕</button>
      </div>

      <div
        className="flex items-center gap-2 px-2 py-1 shrink-0"
        style={{ background: "var(--t-bg-light)", borderBottom: "2px solid var(--t-border-dark)" }}
      >
        <Avatar contact={contact} size={32} />
        <div className="flex flex-col min-w-0">
          <span className="font-bold tracking-widest truncate" style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text)" }}>
            {STATUS_ICONS[contact.onlineStatus]} {displayName}
          </span>
          <span className="tracking-wider truncate" style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
            {contact.statusMessage || STATUS_LABELS[contact.onlineStatus]}
          </span>
        </div>
      </div>

      {winkMsg && (
        <div
          className="text-center tracking-widest py-1 shrink-0"
          style={{ fontSize: "var(--t-text-xs)", background: "var(--t-accent)", color: "var(--t-titlebar-text)", animation: "blink 0.5s step-end infinite" }}
        >
          {winkMsg}
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
                {!isMe && (
                  <div style={{ fontSize: 18 }}>
                    {contact.avatarDataUrl
                      ? <img src={contact.avatarDataUrl} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} />
                      : getDefaultAvatar(contact.id)}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: 280, padding: "4px 8px",
                    fontSize: "var(--t-text-sm)", fontFamily: "var(--t-font-display)",
                    lineHeight: 1.4, wordBreak: "break-word", border: "2px solid",
                    ...(isMe
                      ? {
                          background: "var(--t-accent)", color: "var(--t-titlebar-text)",
                          borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
                          borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
                          borderRadius: "4px 4px 0 4px",
                        }
                      : {
                          background: "var(--t-card-hover)", color: "var(--t-text)",
                          borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
                          borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
                          borderRadius: "4px 4px 4px 0",
                        }),
                  }}
                >
                  {!isMe && <div style={{ fontWeight: "bold", fontSize: "var(--t-text-xs)", marginBottom: 2, color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>{displayName}</div>}
                  {text}
                </div>
                {isMe && (
                  <div style={{ fontSize: 18 }}>
                    {myAvatar
                      ? <img src={myAvatar} alt="" style={{ width: 20, height: 20, objectFit: "cover" }} />
                      : getDefaultAvatar(myId)}
                  </div>
                )}
              </div>
              <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle)", marginTop: 1, paddingLeft: isMe ? 0 : 24, paddingRight: isMe ? 24 : 0 }}>
                {time}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div
        className="flex items-center gap-1 px-2 py-1 shrink-0"
        style={{ background: "var(--t-bg-light)", borderTop: "2px solid", borderTopColor: "var(--t-border-dark)", borderBottom: "1px solid var(--t-border-dark)" }}
      >
        {[":)", ":D", ":(", ";)", ":P", "XD"].map((code) => (
          <button key={code} onClick={() => setInput((v) => v + code)} title={code}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1 }}
          >
            {MSN_EMOTICONS[code]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={sendNudge} title="Envoyer un nudge !"
          style={{
            background: "var(--t-bg)", border: "2px solid",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
            cursor: "pointer", fontSize: 11, padding: "1px 6px",
            fontFamily: "var(--t-font-display)", color: "var(--t-text)", letterSpacing: "0.1em",
          }}
        >🫨 Nudge</button>
      </div>

      <div
        className="flex items-center gap-2 px-2 py-2 shrink-0"
        style={{ background: "var(--t-bg)", borderTop: "2px solid var(--t-border-light)" }}
      >
        <input
          ref={inputRef} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Écrivez un message... (Entrée pour envoyer)"
          maxLength={500}
          style={{
            flex: 1, padding: "3px 6px", fontSize: "var(--t-text-xs)",
            fontFamily: "var(--t-font-display)", border: "2px solid",
            borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
            background: "var(--t-app-bg)", color: "var(--t-text)", outline: "none",
          }}
        />
        <button
          onClick={send} disabled={isSending || !input.trim()}
          style={{
            padding: "3px 12px", fontSize: 11, fontFamily: "var(--t-font-display)",
            background: "var(--t-bg)", color: "var(--t-text)", border: "2px solid",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
            cursor: isSending || !input.trim() ? "not-allowed" : "pointer",
            opacity: !input.trim() ? 0.5 : 1, letterSpacing: "0.1em",
          }}
        >
          {isSending ? "..." : "Envoyer"}
        </button>
      </div>

      <style>{`
        @keyframes nudge {
          0% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          100% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}

// ── DraggableChatWindow ────────────────────────────────────────────────────────

function DraggableChatWindow({ contact, myId, myAvatar, onClose }: {
  contact: Contact; myId: string; myAvatar: string | null;
  onClose: () => void;
}) {
  const [pos, setPos] = useState(() => ({ x: Math.max(0, window.innerWidth - 500), y: Math.max(0, window.innerHeight - 560) }));
  const dragging = useRef(false);
  const origin = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const posRef = useRef(pos);
  useEffect(() => { posRef.current = pos; }, [pos]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    origin.current = { mx: e.clientX, my: e.clientY, wx: posRef.current.x, wy: posRef.current.y };
    e.preventDefault();
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      setPos({ x: origin.current.wx + e.clientX - origin.current.mx, y: origin.current.wy + e.clientY - origin.current.my });
    }
    function onUp() { dragging.current = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 99998, boxShadow: "4px 4px 0 rgba(0,0,0,0.3)" }}>
      <ChatWindow
        contact={contact} myId={myId} myAvatar={myAvatar}
        onClose={onClose} onDragStart={onMouseDown}
      />
    </div>
  );
}

// ── MsnApp ────────────────────────────────────────────────────────────────────

export function MsnApp(_: AppProps) {
  const { user } = useAuth();
  const { openWindow } = useWindowActions();
  const { totalUnread, unreadCounts, onNudgeOpen, onStatusUpdate } = useMessenger();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChats, setOpenChats] = useState<Record<string, boolean>>({});
  const [myStatus, setMyStatus] = useState<Contact["onlineStatus"]>("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [myAwayMsg] = useState(() => getRandomAwayMessage());
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tell the global messenger where to open a chat when a nudge arrives while MSN is open
  useEffect(() => {
    onNudgeOpen.current = (contactId: string) => {
      setOpenChats(prev => prev[contactId] ? prev : { ...prev, [contactId]: true });
    };
    return () => { onNudgeOpen.current = null; };
  }, [onNudgeOpen]);

  // Real-time status updates via the global SSE connection
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

  const loadContacts = useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/profiles/list");
    if (!res.ok) return;
    const data = await res.json();
    const all: Contact[] = (data.users || [])
      .filter((u: { username?: string | null }) => u.username !== user.username)
      .map((u: {
        id: string; name: string; username: string | null; displayUsername?: string | null;
        statusMessage?: string | null; avatarDataUrl?: string | null; onlineStatus?: string | null;
      }) => ({ ...u, onlineStatus: (u.onlineStatus as Contact["onlineStatus"]) ?? "offline" }));
    const order: Contact["onlineStatus"][] = ["online", "away", "busy", "offline"];
    all.sort((a, b) => order.indexOf(a.onlineStatus) - order.indexOf(b.onlineStatus));
    setContacts(all);
    setLoading(false);
    setLastSync(new Date());
  }, [user]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  async function handleStatusChange(newStatus: Contact["onlineStatus"]) {
    setMyStatus(newStatus);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onlineStatus: newStatus }),
    });
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadContacts();
    setLastSync(new Date());
    setIsRefreshing(false);
  }

  function toggleChat(contact: Contact) {
    setOpenChats(prev => ({ ...prev, [contact.id]: !prev[contact.id] }));
  }

  function openProfile(username: string | null) {
    if (!username) return;
    openWindow(`profile:${username}`, username, "👤");
  }

  const filtered = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (c.displayUsername || c.username || c.name).toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col" style={{ height: "100%", minHeight: 480, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", position: "relative" }}>
      <div className="shrink-0 px-3 py-2" style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)" }}>
        <div className="flex items-center gap-3">
          <MsnLogo size={40} />
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: "var(--t-font-display)", fontWeight: "bold", fontSize: "var(--t-text-sm)", letterSpacing: "0.1em" }}>GunthMessenger™</div>
            <div style={{ fontSize: "var(--t-text-xs)", opacity: 0.85, fontFamily: "var(--t-font-display)" }}>v6.0 — Temps réel activé ⚡</div>
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
            <div style={{ fontFamily: "var(--t-font-display)", fontWeight: "bold", fontSize: "var(--t-text-xs)", color: "var(--t-titlebar-text)" }}>{user?.name || "Moi"}</div>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)", fontStyle: "italic", opacity: 0.8 }}>{myAwayMsg}</div>
          </div>
          <select
            value={myStatus}
            onChange={(e) => handleStatusChange(e.target.value as Contact["onlineStatus"])}
            style={{ fontSize: "var(--t-text-xs)", background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", color: "var(--t-text)", cursor: "pointer", fontFamily: "var(--t-font-display)", padding: "1px 2px" }}
          >
            <option value="online">🟢 En ligne</option>
            <option value="away">🟡 Absent</option>
            <option value="busy">🔴 Occupé</option>
            <option value="offline">⚫ Invisible</option>
          </select>
        </div>
      </div>

      <div className="shrink-0 px-2 py-1 flex items-center gap-1" style={{ background: "var(--t-bg-light)", borderBottom: "2px solid var(--t-border-dark)" }}>
        <input
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Rechercher un contact..."
          style={{ flex: 1, padding: "2px 6px", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", background: "var(--t-app-bg)", color: "var(--t-text)", border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", outline: "none" }}
        />
        <button
          onClick={handleRefresh} disabled={isRefreshing}
          title={lastSync ? `Dernière sync: ${lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Actualiser"}
          style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: isRefreshing ? "wait" : "pointer", fontSize: 12, padding: "1px 5px", lineHeight: 1.4, animation: isRefreshing ? "spin 0.8s linear infinite" : "none", display: "inline-flex", alignItems: "center" }}
        >🔄</button>
      </div>

      {lastSync && (
        <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)", textAlign: "right", padding: "1px 8px", background: "var(--t-bg-light)", borderBottom: "1px solid var(--t-border-dark)" }}>
          ⏱ {lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!user ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ color: "var(--t-text-muted)" }}>
            <div style={{ fontSize: 48 }}>🔒</div>
            <div style={{ fontSize: "var(--t-text-sm)", letterSpacing: "0.1em" }}>Connexion requise</div>
            <div style={{ fontSize: "var(--t-text-xs)", letterSpacing: "0.08em", color: "var(--t-text-subtle)" }}>Identifiez-vous pour accéder à GunthMessenger™</div>
            <button
              onClick={() => openWindow("login", "Connexion GunthOS", "🔑")}
              style={{ padding: "4px 16px", fontSize: 11, fontFamily: "var(--t-font-display)", background: "var(--t-bg)", color: "var(--t-text)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", letterSpacing: "0.1em" }}
            >🔑 Se connecter</button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6" style={{ color: "var(--t-text-muted)" }}>
            <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>⌛</div>
            <div style={{ fontSize: "var(--t-text-xs)", letterSpacing: "0.1em" }}>Chargement des contacts...</div>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle)" }}>Négociation avec le serveur 56K...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--t-text-muted)" }}>
            <div style={{ fontSize: 32 }}>🦗</div>
            <div style={{ fontSize: "var(--t-text-xs)", letterSpacing: "0.1em", marginTop: 8 }}>Aucun contact trouvé</div>
            <div style={{ fontSize: "var(--t-text-xs)", marginTop: 4, color: "var(--t-text-subtle)" }}>Vous êtes seul(e) sur GunthOS.<br />C&apos;est très triste.</div>
          </div>
        ) : (
          <>
            {renderGroup("En ligne", filtered.filter(c => c.onlineStatus === "online"), openChats, unreadCounts, toggleChat, openProfile)}
            {renderGroup("Absent / Occupé", filtered.filter(c => c.onlineStatus === "away" || c.onlineStatus === "busy"), openChats, unreadCounts, toggleChat, openProfile)}
            {renderGroup("Hors ligne", filtered.filter(c => c.onlineStatus === "offline"), openChats, unreadCounts, toggleChat, openProfile)}
          </>
        )}
      </div>

      <div className="shrink-0 px-3 py-1 flex items-center justify-between" style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)", fontSize: "var(--t-text-xs)", fontFamily: "var(--t-font-display)", opacity: 0.85 }}>
        <span>GunthMessenger™ 2003 Edition</span>
        <span>© Gunth Corp. Tous droits réservés.</span>
      </div>

      {user && Object.entries(openChats)
        .filter(([contactId, isOpen]) => isOpen && contacts.some(c => c.id === contactId))
        .map(([contactId]) => {
          const contact = contacts.find(c => c.id === contactId);
          if (!contact) return null;
          return (
            <DraggableChatWindow
              key={contactId}
              contact={contact}
              myId={user.id}
              myAvatar={myAvatar}
              onClose={() => setOpenChats(prev => ({ ...prev, [contactId]: false }))}
            />
          );
        })}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes badgePop { 0% { transform: scale(0.5); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

function renderGroup(
  label: string, contacts: Contact[],
  openChats: Record<string, boolean>, unreadCounts: Record<string, number>,
  toggleChat: (c: Contact) => void, openProfile: (username: string | null) => void,
) {
  if (contacts.length === 0) return null;
  return (
    <div key={label}>
      <div
        className="flex items-center gap-1 px-2 py-1 select-none"
        style={{ background: "var(--t-bg-dark)", borderBottom: "1px solid var(--t-border-dark)", borderTop: "1px solid var(--t-border-light)", fontSize: 11, color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", letterSpacing: "0.08em" }}
      >
        <span>▸</span><span>{label}</span><span style={{ opacity: 0.6 }}>({contacts.length})</span>
      </div>
      {contacts.map((contact) => {
        const displayName = contact.displayUsername || contact.username || contact.name;
        const isOpen = openChats[contact.id];
        const unread = unreadCounts[contact.id] ?? 0;
        return (
          <div
            key={contact.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer group"
            style={{ borderBottom: "1px solid var(--t-border-dark)", background: isOpen ? "var(--t-card-hover)" : "transparent", transition: "background 0.1s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--t-card-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isOpen ? "var(--t-card-hover)" : "transparent"; }}
          >
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
              <button onClick={(e) => { e.stopPropagation(); toggleChat(contact); }} title="Envoyer un message"
                style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", fontSize: 12, padding: "1px 4px", position: "relative" }}
              >💬</button>
              <button onClick={(e) => { e.stopPropagation(); openProfile(contact.username); }} title="Voir le profil"
                style={{ background: "var(--t-bg)", border: "2px solid", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", cursor: "pointer", fontSize: 12, padding: "1px 4px" }}
              >👤</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
