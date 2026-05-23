"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { GUNTHER_LOADING_HINTS, GUNTHER_STATUS_BAR_MSGS } from "@/lib/gunth-jokes";
import { pickRandom } from "@/lib/utils/random";
import { APP_REGISTRY } from "@/apps";
import type { AppProps } from "@/types";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🚀", "👀"];

type Status = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high" | "critical";
type Label = "bug" | "feature" | "chore" | "ui" | "audio" | "db";

interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  label: Label | null;
  scope: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeUsername: string | null;
  assigneeAvatar: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdByUsername: string | null;
  createdByAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

const OS_SCOPES: { value: string; label: string }[] = [
  { value: "os:window-manager", label: "🪟 Window Manager" },
  { value: "os:audio", label: "🔊 Audio System" },
  { value: "os:db", label: "🗄️ Database" },
  { value: "os:auth", label: "🔑 Auth" },
  { value: "os:taskbar", label: "📌 Taskbar" },
  { value: "os:boot", label: "💾 Boot / Shell" },
  { value: "os:themes", label: "🎨 Themes / CSS" },
  { value: "os:core", label: "⚙️ OS Core" },
];

function getScopeLabel(scope: string | null): string {
  if (!scope) return "";
  const os = OS_SCOPES.find((s) => s.value === scope);
  if (os) return os.label;
  const app = APP_REGISTRY.find((a) => `app:${a.slug}` === scope);
  if (app) return `${app.emoji} ${app.name}`;
  return scope;
}

function ScopeSelect({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={style}>
      <option value="">— aucun —</option>
      <optgroup label="Apps">
        {APP_REGISTRY.map((a) => (
          <option key={a.slug} value={`app:${a.slug}`}>
            {a.emoji} {a.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="OS">
        {OS_SCOPES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </optgroup>
    </select>
  );
}

const COLUMNS: { key: Status; label: string; icon: string; accentColor: string; emptyMsgs: string[]; subtitles: string[] }[] = [
  { key: "todo", label: "À FAIRE", icon: "📥", accentColor: "var(--t-text-muted)",
    subtitles: [
      "— le backlog vous observe",
      "— tickets en attente de volontaires",
      "— salle d'attente des problèmes",
      "— non priorisé depuis 2003",
    ],
    emptyMsgs: [
      "Backlog vide.\nQuelqu'un a tout mis en 'En cours'.",
      "Rien ici.\nProfitez-en, ça durera pas.",
      "À faire : zéro.\nC'est statistiquement impossible.",
      "Propre ici.\nC'est louche. Très louche.",
    ],
  },
  { key: "in_progress", label: "EN COURS", icon: "⚙️", accentColor: "#c88a00",
    subtitles: [
      "— théoriquement en mouvement",
      "— quelqu'un s'en occupe. Apparemment.",
      "— en cours depuis un moment",
      "— ça avance. C'est ce qu'on dit.",
    ],
    emptyMsgs: [
      "En cours : rien.\nL'équipe est en réunion à ce sujet.",
      "Personne ne travaille.\nC'est suspect.",
      "Vide.\nComme le compte rendu du dernier sprint.",
      "Aucune tâche active.\nLe velocity chart va être intéressant.",
    ],
  },
  { key: "done", label: "TERMINÉ", icon: "✅", accentColor: "#2a6e28",
    subtitles: [
      "— définition de terminé : discutable",
      "— prêt à rouvrir à la prochaine démo",
      "— fermé jusqu'à nouvel incident",
      "— victoires officielles de l'équipe",
    ],
    emptyMsgs: [
      "0 tickets fermés.\nMais l'équipe était très busy.",
      "Aucun ticket terminé.\nÇa arrive. Souvent.",
      "Rien de livré.\nEn revanche le café a été bu.",
      "Terminé : néant.\nLe retro va être intéressant.",
    ],
  },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#5a6268",
  medium: "#0055bb",
  high: "#cc4400",
  critical: "#bb0000",
};

const PRIORITY_BG: Record<Priority, string> = {
  low: "#e8e8e8",
  medium: "#d0e4ff",
  high: "#ffe0cc",
  critical: "#ffd0d0",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Pas urgent",
  medium: "Bof urgent",
  high: "Assez urgent",
  critical: "🚨 PANIQUE",
};

const PRIORITY_LABELS_LONG: Record<Priority, string> = {
  low: "Pas urgent (on verra jamais)",
  medium: "Moyen (sera critique vendredi)",
  high: "Élevé (pour de vrai cette fois)",
  critical: "🚨 PANIQUE TOTALE",
};

const LABEL_COLORS: Record<Label, string> = {
  bug: "#aa0000",
  feature: "#004fa8",
  chore: "#555",
  ui: "#7a1a8a",
  audio: "#b85000",
  db: "#1a6e30",
};

const LABEL_ICONS: Record<Label, string> = {
  bug: "🐛",
  feature: "✨",
  chore: "🔧",
  ui: "🎨",
  audio: "🔊",
  db: "🗄️",
};

const LABEL_NAMES: Record<Label, string> = {
  bug: "bug (encore un)",
  feature: "feature (optionnelle)",
  chore: "corvée",
  ui: "esthétique (subjectif)",
  audio: "bruit suspect",
  db: "bdd (touchez pas)",
};

const INSET = {
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: "var(--t-border-dark)",
  borderLeftColor: "var(--t-border-dark)",
  borderBottomColor: "var(--t-border-light)",
  borderRightColor: "var(--t-border-light)",
} as const;

const RAISED = {
  borderWidth: 2,
  borderStyle: "solid",
  borderTopColor: "var(--t-border-light)",
  borderLeftColor: "var(--t-border-light)",
  borderBottomColor: "var(--t-border-dark)",
  borderRightColor: "var(--t-border-dark)",
} as const;

interface GunthUser {
  id: string;
  name: string;
  username: string | null;
  avatarDataUrl: string | null;
}

interface NewTicketForm {
  title: string;
  description: string;
  priority: Priority;
  label: Label | "";
  scope: string;
  assigneeId: string;
}

const EMPTY_FORM: NewTicketForm = {
  title: "",
  description: "",
  priority: "medium",
  label: "",
  scope: "",
  assigneeId: "",
};

export function GuntherBoardApp(_: AppProps) {
  const { user } = useAuth();
  const { playClick, playPop, playDelete } = useSoundContext();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<GunthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewTicketForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editingDetail, setEditingDetail] = useState(false);
  const [detailForm, setDetailForm] = useState<Partial<Ticket>>({});
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [loadDots, setLoadDots] = useState(0);
  const [loadHint] = useState(() => pickRandom(GUNTHER_LOADING_HINTS));
  const [statusBarMsg] = useState(() => pickRandom(GUNTHER_STATUS_BAR_MSGS));
  const [colEmptyMsgs] = useState(() =>
    Object.fromEntries(COLUMNS.map((col) => [col.key, pickRandom(col.emptyMsgs)])) as Record<Status, string>
  );
  const [colSubtitles] = useState(() =>
    Object.fromEntries(COLUMNS.map((col) => [col.key, pickRandom(col.subtitles)])) as Record<Status, string>
  );

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [loading]);

  const fetchTickets = useCallback(async () => {
    const res = await fetch("/api/gunther-board");
    if (res.ok) setTickets(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const reset = () => { setDraggedId(null); setDragOverCol(null); };
    document.addEventListener("dragend", reset);
    return () => document.removeEventListener("dragend", reset);
  }, []);

  useEffect(() => {
    fetch("/api/user/list")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []));
  }, []);

  async function createTicket() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/gunther-board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, label: form.label || null, scope: form.scope || null, assigneeId: form.assigneeId || null }),
    });
    if (res.ok) {
      playPop();
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchTickets();
    }
    setSubmitting(false);
  }

  async function moveTicket(id: number, status: Status) {
    playClick();
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    await fetch(`/api/gunther-board/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function handleDragStart(id: number) { setDraggedId(id); }
  function handleDragEnd() { setDraggedId(null); setDragOverCol(null); }

  async function handleDrop(targetStatus: Status) {
    if (draggedId === null) return;
    const ticket = tickets.find((t) => t.id === draggedId);
    if (!ticket || ticket.status === targetStatus) return;
    await moveTicket(draggedId, targetStatus);
  }

  async function deleteTicket(id: number) {
    playDelete();
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setSelectedTicket(null);
    await fetch(`/api/gunther-board/${id}`, { method: "DELETE" });
  }

  async function saveDetail() {
    if (!selectedTicket) return;
    const res = await fetch(`/api/gunther-board/${selectedTicket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detailForm),
    });
    if (res.ok) {
      playPop();
      const updated = await res.json();
      const assignee = users.find((u) => u.id === updated.assigneeId) ?? (user?.id === updated.assigneeId ? user : null);
      const enriched = {
        ...updated,
        assigneeName: assignee?.name ?? (updated.assigneeId ? selectedTicket.assigneeName : null),
        assigneeUsername: (assignee as GunthUser | null)?.username ?? (updated.assigneeId ? selectedTicket.assigneeUsername : null),
        assigneeAvatar: (assignee as GunthUser | null)?.avatarDataUrl ?? (updated.assigneeId ? selectedTicket.assigneeAvatar : null),
      };
      setTickets((prev) => prev.map((t) => t.id === enriched.id ? { ...t, ...enriched } : t));
      setSelectedTicket((prev) => prev ? { ...prev, ...enriched } : null);
      setEditingDetail(false);
    }
  }

  const byStatus = (s: Status) => tickets.filter((t) => t.status === s);

  const totalCount = tickets.length;
  const ticketCountLabel =
    totalCount === 0 ? "0 ticket — profitez-en" :
    totalCount === 1 ? "1 ticket — c'est un début" :
    totalCount > 30 ? `${totalCount} tickets — appelez des renforts` :
    totalCount > 15 ? `${totalCount} tickets — situation tendue` :
    `${totalCount} tickets`;

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-3"
        style={{ backgroundColor: "var(--t-bg)", fontFamily: "var(--t-font-display)" }}
      >
        <div
          style={{
            ...INSET,
            padding: "16px 24px",
            backgroundColor: "var(--t-app-bg)",
            textAlign: "center",
            minWidth: 260,
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: "var(--t-text-base)", fontWeight: "bold", color: "var(--t-text)", marginBottom: 6 }}>
            GuntherBoard™
          </div>
          <div
            style={{
              ...INSET,
              height: 12,
              backgroundColor: "var(--t-app-bg)",
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                height: "100%",
                width: "60%",
                background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
                animation: "gb-scan 1.2s ease-in-out infinite alternate",
              }}
            />
          </div>
          <div style={{ fontSize: "var(--t-text-sm)", color: "var(--t-text-muted)" }}>
            Synchronisation{".".repeat(loadDots)}
          </div>
          <div style={{ fontSize: "var(--t-text-base)", color: "var(--t-text-subtle)", fontStyle: "italic", marginTop: 4 }}>
            {loadHint}
          </div>
        </div>
        <style>{`
          @keyframes gb-scan {
            from { transform: translateX(-40%); }
            to   { transform: translateX(80%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gb-root" style={{ fontFamily: "var(--t-font-display)", backgroundColor: "var(--t-bg)" }}>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          backgroundColor: "var(--t-bg)",
          borderBottom: "2px solid var(--t-border-dark)",
          borderTop: "none",
          padding: "3px 6px",
          gap: 6,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              ...RAISED,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "1px 6px",
              backgroundColor: "var(--t-bg)",
              fontSize: "var(--t-text-base)",
              fontWeight: "bold",
              color: "var(--t-text)",
              letterSpacing: "0.04em",
            }}
          >
            📋 GuntherBoard™
          </span>
          <span
            style={{
              fontSize: "var(--t-text-sm)",
              color: "var(--t-text-muted)",
              fontStyle: "italic",
            }}
          >
            {ticketCountLabel}
          </span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => { playClick(); setShowForm(true); }}
            disabled={!user}
            title={!user ? "Connectez-vous d'abord (sinon à qui on attribue la faute ?)" : "Créer un ticket (quelqu'un finira par le lire)"}
            style={{
              ...RAISED,
              padding: "2px 10px",
              fontSize: "var(--t-text-sm)",
              backgroundColor: user ? "var(--t-bg)" : "var(--t-bg)",
              color: user ? "var(--t-text)" : "var(--t-text-subtle)",
              cursor: user ? "pointer" : "not-allowed",
              fontFamily: "var(--t-font-display)",
              fontWeight: user ? "bold" : "normal",
            }}
          >
            + Nouveau ticket
          </button>
          <button
            onClick={() => { playClick(); fetchTickets(); }}
            title="Rafraîchir (ça changera rien)"
            style={{
              ...RAISED,
              padding: "2px 7px",
              fontSize: "var(--t-text-sm)",
              backgroundColor: "var(--t-bg)",
              color: "var(--t-text)",
              cursor: "pointer",
              fontFamily: "var(--t-font-display)",
            }}
          >
            ↻
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Kanban board ────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-x-auto" style={{ gap: 0 }}>
          {COLUMNS.map((col, colIdx) => {
            const isOver = dragOverCol === col.key && draggedId !== null;
            const draggedTicket = tickets.find((t) => t.id === draggedId);
            const sameCol = draggedTicket?.status === col.key;
            const colTickets = byStatus(col.key);

            return (
              <div
                key={col.key}
                className="flex flex-col flex-1"
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key); }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null);
                }}
                onDrop={() => handleDrop(col.key)}
                style={{
                  minWidth: 220,
                  borderRight: colIdx < COLUMNS.length - 1 ? "2px solid var(--t-border-dark)" : "none",
                  borderLeft: colIdx < COLUMNS.length - 1 ? "none" : "none",
                  outline: isOver && !sameCol ? "2px dashed var(--t-accent)" : "none",
                  outlineOffset: -2,
                  backgroundColor: isOver && !sameCol ? "var(--t-card-hover)" : "var(--t-bg)",
                  transition: "background-color 0.1s",
                }}
              >
                {/* Column accent bar */}
                <div style={{ height: 3, backgroundColor: col.accentColor, flexShrink: 0 }} />

                {/* Column header */}
                <div
                  style={{
                    borderBottom: "2px solid var(--t-border-dark)",
                    borderTop: "2px solid var(--t-border-light)",
                    padding: "5px 8px 4px",
                    backgroundColor: "var(--t-bg)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: "var(--t-text-base)" }}>{col.icon}</span>
                      <span
                        style={{
                          fontSize: "var(--t-text-sm)",
                          fontWeight: "bold",
                          color: col.accentColor,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {col.label}
                      </span>
                    </div>
                    <div
                      style={{
                        ...INSET,
                        minWidth: 22,
                        textAlign: "center",
                        fontSize: "var(--t-text-sm)",
                        fontWeight: "bold",
                        color: colTickets.length > 0 ? col.accentColor : "var(--t-text-subtle)",
                        backgroundColor: "var(--t-app-bg)",
                        padding: "0px 5px",
                        lineHeight: "18px",
                      }}
                    >
                      {colTickets.length}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "var(--t-text-xs)",
                      fontStyle: "italic",
                      color: "var(--t-text-subtle)",
                      marginTop: 2,
                    }}
                  >
                    {colSubtitles[col.key]}
                  </div>
                </div>

                {/* Tickets list */}
                <div
                  className="flex-1 overflow-y-auto flex flex-col"
                  style={{ padding: "6px", gap: 5, display: "flex", flexDirection: "column" }}
                >
                  {colTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      isSelected={selectedTicket?.id === ticket.id}
                      isDragging={draggedId === ticket.id}
                      onClick={() => {
                        playClick();
                        setSelectedTicket(ticket);
                        setDetailForm({});
                        setEditingDetail(false);
                      }}
                      onMove={moveTicket}
                      onDelete={deleteTicket}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      currentStatus={col.key}
                    />
                  ))}
                  {colTickets.length === 0 && (
                    <div
                      className="text-center"
                      style={{
                        margin: "auto",
                        padding: "12px 8px",
                        fontSize: "var(--t-text-xs)",
                        color: "var(--t-text-subtle)",
                        fontStyle: "italic",
                        whiteSpace: "pre-line",
                        lineHeight: 1.6,
                      }}
                    >
                      {isOver && !sameCol ? "📥 Déposer ici" : colEmptyMsgs[col.key]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

          {/* ── Detail panel ────────────────────────────────────────────── */}
        {selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            editing={editingDetail}
            detailForm={detailForm}
            users={users}
            currentUser={user}
            onClose={() => { playClick(); setSelectedTicket(null); setEditingDetail(false); }}
            onEdit={() => {
              playClick();
              setEditingDetail(true);
              setDetailForm({
                title: selectedTicket.title,
                description: selectedTicket.description,
                priority: selectedTicket.priority,
                label: selectedTicket.label,
                scope: selectedTicket.scope,
                assigneeId: selectedTicket.assigneeId,
              });
            }}
            onSave={saveDetail}
            onDelete={deleteTicket}
            onCancelEdit={() => setEditingDetail(false)}
            onChange={(patch) => setDetailForm((p) => ({ ...p, ...patch }))}
          />
        )}
      </div>

      {/* ── Status bar ──────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center px-3"
        style={{
          borderTop: "2px solid var(--t-border-dark)",
          backgroundColor: "var(--t-bg)",
          fontSize: "var(--t-text-xs)",
          color: "var(--t-text-muted)",
          fontStyle: "italic",
          minHeight: 22,
          letterSpacing: "0.04em",
        }}
      >
        {statusBarMsg}
      </div>

      {/* ── New ticket modal ─────────────────────────────────────────── */}
      {showForm && (
        <NewTicketModal
          form={form}
          submitting={submitting}
          users={users}
          currentUser={user}
          onChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
          onSubmit={createTicket}
          onClose={() => { playClick(); setShowForm(false); setForm(EMPTY_FORM); }}
        />
      )}
    </div>
  );
}

// ── UserAvatar ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#c0392b", "#2980b9", "#27ae60", "#8e44ad",
  "#e67e22", "#16a085", "#d35400", "#1a5276",
];

function UserAvatar({ name, avatarDataUrl, size = 22 }: { name: string; avatarDataUrl?: string | null; size?: number }) {
  const initials = name.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("").toUpperCase() || "?";
  const idx = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    border: "1px solid rgba(0,0,0,0.25)",
    userSelect: "none",
    overflow: "hidden",
  };
  if (avatarDataUrl) {
    return (
      <div title={name} style={baseStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarDataUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div
      title={name}
      style={{
        ...baseStyle,
        backgroundColor: AVATAR_COLORS[idx],
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "var(--t-text-xs)",
        fontWeight: "bold",
        letterSpacing: 0,
        fontFamily: "var(--t-font-display)",
      }}
    >
      {initials}
    </div>
  );
}

// ── TicketCard ────────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  isSelected,
  isDragging,
  onClick,
  onMove,
  onDelete,
  onDragStart,
  onDragEnd,
  currentStatus,
}: {
  ticket: Ticket;
  isSelected: boolean;
  isDragging: boolean;
  onClick: () => void;
  onMove: (id: number, status: Status) => void;
  onDelete: (id: number) => void;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  currentStatus: Status;
}) {
  const prev = currentStatus === "in_progress" ? "todo" : currentStatus === "done" ? "in_progress" : null;
  const next = currentStatus === "todo" ? "in_progress" : currentStatus === "in_progress" ? "done" : null;
  const priorityColor = PRIORITY_COLORS[ticket.priority];

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(ticket.id); }}
      onDragEnd={onDragEnd}
      style={{
        ...RAISED,
        backgroundColor: isSelected ? "var(--t-card-hover)" : "#fff",
        cursor: "grab",
        color: "var(--t-text)",
        opacity: isDragging ? 0.3 : 1,
        transition: "opacity 0.1s",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        outline: isSelected ? "2px solid var(--t-accent)" : "none",
        outlineOffset: -2,
      }}
    >
      {/* Left priority stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 5,
          backgroundColor: priorityColor,
        }}
      />

      {/* Card body */}
      <div style={{ paddingLeft: 11, paddingRight: 7, paddingTop: 6, paddingBottom: 5 }}>

        {/* Top row: title + assignee avatar */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
          <span
            style={{
              fontWeight: "bold",
              lineHeight: 1.35,
              flex: 1,
              fontSize: "var(--t-text-sm)",
              color: "var(--t-text)",
            }}
          >
            {ticket.title}
          </span>
          {ticket.assigneeName ? (
            <UserAvatar name={ticket.assigneeName} avatarDataUrl={ticket.assigneeAvatar} size={22} />
          ) : (
            <div
              title="Non assigné"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "1.5px dashed var(--t-border-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-subtle)",
                flexShrink: 0,
                opacity: 0.45,
              }}
            >
              ?
            </div>
          )}
        </div>

        {/* Meta row: #id + priority + label + scope */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3, marginBottom: 5 }}>
          <span
            style={{
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-subtle)",
              fontStyle: "italic",
              marginRight: 1,
            }}
          >
            #{ticket.id}
          </span>
          <span
            style={{
              fontSize: "var(--t-text-xs)",
              padding: "1px 5px",
              color: priorityColor,
              backgroundColor: PRIORITY_BG[ticket.priority],
              border: `1px solid ${priorityColor}`,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              lineHeight: 1.5,
            }}
          >
            {PRIORITY_LABELS[ticket.priority]}
          </span>
          {ticket.label && (
            <span
              style={{
                backgroundColor: LABEL_COLORS[ticket.label],
                color: "#fff",
                padding: "1px 5px",
                fontSize: "var(--t-text-xs)",
                whiteSpace: "nowrap",
                lineHeight: 1.5,
              }}
            >
              {LABEL_ICONS[ticket.label]} {ticket.label}
            </span>
          )}
          {ticket.scope && (
            <span
              style={{
                ...RAISED,
                padding: "1px 4px",
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text-muted)",
                backgroundColor: "var(--t-bg)",
                whiteSpace: "nowrap",
                lineHeight: 1.5,
              }}
            >
              {getScopeLabel(ticket.scope)}
            </span>
          )}
        </div>

        {/* Action row */}
        <div
          style={{
            borderTop: "1px solid var(--t-border-dark)",
            paddingTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {prev ? (
            <button
              onClick={() => onMove(ticket.id, prev)}
              title="Reculer (ça arrive)"
              style={{
                ...RAISED,
                fontSize: "var(--t-text-xs)",
                padding: "1px 6px",
                backgroundColor: "var(--t-bg)",
                color: "var(--t-text-muted)",
                cursor: "pointer",
                fontFamily: "var(--t-font-display)",
                lineHeight: "14px",
              }}
            >
              ◀
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          {next ? (
            <button
              onClick={() => onMove(ticket.id, next)}
              title="Avancer (enfin)"
              style={{
                ...RAISED,
                fontSize: "var(--t-text-xs)",
                padding: "1px 6px",
                backgroundColor: "var(--t-bg)",
                color: "var(--t-text-muted)",
                cursor: "pointer",
                fontFamily: "var(--t-font-display)",
                lineHeight: "14px",
              }}
            >
              ▶
            </button>
          ) : (
            <span style={{ width: 20 }} />
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => onDelete(ticket.id)}
            title="Supprimer (méthode Gunther de clôture de ticket)"
            style={{
              background: "none",
              border: "none",
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-subtle)",
              cursor: "pointer",
              fontFamily: "var(--t-font-display)",
              padding: "1px 3px",
              lineHeight: 1,
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TicketDetail ──────────────────────────────────────────────────────────────

function TicketDetail({
  ticket,
  editing,
  detailForm,
  users,
  currentUser,
  onClose,
  onEdit,
  onSave,
  onDelete,
  onCancelEdit,
  onChange,
}: {
  ticket: Ticket;
  editing: boolean;
  detailForm: Partial<Ticket>;
  users: GunthUser[];
  currentUser: { id: string; name: string } | null;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: (id: number) => void;
  onCancelEdit: () => void;
  onChange: (patch: Partial<Ticket>) => void;
}) {
  const fieldStyle: React.CSSProperties = {
    ...INSET,
    padding: "2px 5px",
    backgroundColor: "var(--t-app-bg)",
    color: "var(--t-text)",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-sm)",
    width: "100%",
  };

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        ...INSET,
        width: 272,
        backgroundColor: "var(--t-app-bg)",
        fontSize: "var(--t-text-sm)",
        color: "var(--t-text)",
        overflow: "hidden",
      }}
    >
      {/* Titlebar */}
      <div
        className="flex items-center justify-between px-2 shrink-0"
        style={{
          background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
          color: "#fff",
          fontSize: "var(--t-text-sm)",
          fontWeight: "bold",
          height: 22,
          gap: 4,
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📋 Ticket #{ticket.id}
        </span>
        <button
          onClick={onClose}
          style={{
            ...RAISED,
            background: "var(--t-bg)",
            color: "var(--t-text)",
            cursor: "pointer",
            fontSize: "var(--t-text-xs)",
            fontWeight: "bold",
            width: 16,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
            fontFamily: "var(--t-font-display)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Status bar strip */}
      <div
        style={{
          height: 4,
          backgroundColor: PRIORITY_COLORS[ticket.priority],
          flexShrink: 0,
        }}
      />

      <div className="flex-1 overflow-y-auto" style={{ padding: "8px" }}>
        {editing ? (
          <div className="flex flex-col" style={{ gap: 6 }}>
            <Fieldset legend="Titre">
              <input
                value={detailForm.title ?? ticket.title}
                onChange={(e) => onChange({ title: e.target.value })}
                style={fieldStyle}
              />
            </Fieldset>

            <Fieldset legend="Description">
              <textarea
                value={detailForm.description ?? ticket.description ?? ""}
                onChange={(e) => onChange({ description: e.target.value })}
                rows={4}
                style={{ ...fieldStyle, resize: "none" }}
              />
            </Fieldset>

            <div style={{ display: "flex", gap: 6 }}>
              <Fieldset legend="Priorité" style={{ flex: 1 }}>
                <select
                  value={detailForm.priority ?? ticket.priority}
                  onChange={(e) => onChange({ priority: e.target.value as Priority })}
                  style={fieldStyle}
                >
                  {(["low", "medium", "high", "critical"] as Priority[]).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS_LONG[p]}</option>
                  ))}
                </select>
              </Fieldset>
            </div>

            <Fieldset legend="Label">
              <select
                value={detailForm.label ?? ticket.label ?? ""}
                onChange={(e) => onChange({ label: (e.target.value || null) as Label | null })}
                style={fieldStyle}
              >
                <option value="">— sans étiquette —</option>
                {(Object.keys(LABEL_ICONS) as Label[]).map((l) => (
                  <option key={l} value={l}>{LABEL_ICONS[l]} {LABEL_NAMES[l]}</option>
                ))}
              </select>
            </Fieldset>

            <Fieldset legend="Scope">
              <ScopeSelect
                value={detailForm.scope ?? ticket.scope ?? ""}
                onChange={(v) => onChange({ scope: v || null })}
                style={fieldStyle}
              />
            </Fieldset>

            <Fieldset legend="Assigné à">
              <div className="flex gap-1">
                <select
                  value={detailForm.assigneeId ?? ticket.assigneeId ?? ""}
                  onChange={(e) => onChange({ assigneeId: e.target.value || null })}
                  style={{ ...fieldStyle, flex: 1, width: "auto" }}
                >
                  <option value="">— non assigné (problème collectif) —</option>
                  {currentUser && <option value={currentUser.id}>👤 {currentUser.name} (moi)</option>}
                  {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                    <option key={u.id} value={u.id}>👤 {u.name}</option>
                  ))}
                </select>
                {currentUser && (detailForm.assigneeId ?? ticket.assigneeId) !== currentUser.id && (
                  <button
                    onClick={() => onChange({ assigneeId: currentUser.id })}
                    title="M'assigner ce ticket (courageusement)"
                    style={{
                      ...RAISED,
                      padding: "2px 5px",
                      backgroundColor: "var(--t-bg)",
                      color: "var(--t-text)",
                      cursor: "pointer",
                      fontFamily: "var(--t-font-display)",
                      fontSize: "var(--t-text-xs)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ← moi
                  </button>
                )}
              </div>
            </Fieldset>

            <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
              <button
                onClick={onSave}
                style={{
                  ...RAISED,
                  flex: 1,
                  padding: "3px 0",
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  cursor: "pointer",
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-sm)",
                  fontWeight: "bold",
                }}
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={onCancelEdit}
                style={{
                  ...RAISED,
                  padding: "3px 8px",
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  cursor: "pointer",
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-sm)",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 6 }}>
            {/* Title */}
            <div
              style={{
                ...INSET,
                padding: "5px 7px",
                backgroundColor: "var(--t-bg)",
                fontWeight: "bold",
                fontSize: "var(--t-text-base)",
                lineHeight: 1.35,
                color: "var(--t-text)",
              }}
            >
              {ticket.title}
            </div>

            {/* Metadata badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <span
                style={{
                  fontSize: "var(--t-text-xs)",
                  padding: "1px 5px",
                  color: PRIORITY_COLORS[ticket.priority],
                  backgroundColor: PRIORITY_BG[ticket.priority],
                  border: `1px solid ${PRIORITY_COLORS[ticket.priority]}`,
                  fontWeight: "bold",
                }}
              >
                ▲ {PRIORITY_LABELS[ticket.priority]}
              </span>
              {ticket.label && (
                <span
                  style={{
                    backgroundColor: LABEL_COLORS[ticket.label],
                    color: "#fff",
                    padding: "1px 5px",
                    fontSize: "var(--t-text-xs)",
                  }}
                >
                  {LABEL_ICONS[ticket.label]} {LABEL_NAMES[ticket.label]}
                </span>
              )}
              {ticket.scope && (
                <span
                  style={{
                    ...RAISED,
                    padding: "1px 5px",
                    fontSize: "var(--t-text-base)",
                    color: "var(--t-text-muted)",
                    backgroundColor: "var(--t-bg)",
                  }}
                >
                  {getScopeLabel(ticket.scope)}
                </span>
              )}
            </div>

            {/* Description */}
            <Fieldset legend="Description">
              {ticket.description ? (
                <div
                  style={{
                    ...INSET,
                    padding: "4px 6px",
                    backgroundColor: "var(--t-app-bg)",
                    color: "var(--t-text)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    fontSize: "var(--t-text-sm)",
                    minHeight: 36,
                  }}
                >
                  {ticket.description}
                </div>
              ) : (
                <div
                  style={{
                    ...INSET,
                    padding: "4px 6px",
                    backgroundColor: "var(--t-app-bg)",
                    color: "var(--t-text-subtle)",
                    fontStyle: "italic",
                    fontSize: "var(--t-text-xs)",
                  }}
                >
                  Aucune description. Bonne chance à celui qui reprend.
                </div>
              )}
            </Fieldset>

            {/* Assignee */}
            <Fieldset legend="Assigné à">
              <div
                style={{
                  ...INSET,
                  padding: "4px 6px",
                  backgroundColor: "var(--t-app-bg)",
                  fontSize: "var(--t-text-sm)",
                  color: ticket.assigneeName ? "var(--t-text)" : "var(--t-text-subtle)",
                }}
              >
                {ticket.assigneeName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <UserAvatar name={ticket.assigneeName} avatarDataUrl={ticket.assigneeAvatar} size={20} />
                    <span style={{ fontWeight: "bold" }}>{ticket.assigneeName}</span>
                    {ticket.assigneeUsername && (
                      <span style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
                        @{ticket.assigneeUsername}
                      </span>
                    )}
                  </div>
                ) : currentUser ? (
                  <button
                    onClick={onEdit}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--t-accent)",
                      cursor: "pointer",
                      fontFamily: "var(--t-font-display)",
                      fontSize: "var(--t-text-sm)",
                      padding: 0,
                    }}
                  >
                    + M&apos;auto-infliger ce ticket
                  </button>
                ) : (
                  <span style={{ fontStyle: "italic" }}>Personne (problème de tout le monde)</span>
                )}
              </div>
            </Fieldset>

            {/* Reactions */}
            <Fieldset legend="Réactions">
              <TicketReactions ticketId={ticket.id} currentUserId={currentUser?.id ?? null} />
            </Fieldset>

            {/* Creator */}
            <Fieldset legend="Créé par">
              <div
                style={{
                  ...INSET,
                  padding: "4px 6px",
                  backgroundColor: "var(--t-app-bg)",
                  fontSize: "var(--t-text-sm)",
                  color: ticket.createdByName ? "var(--t-text)" : "var(--t-text-subtle)",
                }}
              >
                {ticket.createdByName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <UserAvatar name={ticket.createdByName} avatarDataUrl={ticket.createdByAvatar} size={20} />
                    <span>{ticket.createdByName}</span>
                    {ticket.createdByUsername && (
                      <span style={{ color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
                        @{ticket.createdByUsername}
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontStyle: "italic" }}>Inconnu (mystère total)</span>
                )}
              </div>
            </Fieldset>

            {/* Date */}
            <div
              style={{
                fontSize: "var(--t-text-base)",
                color: "var(--t-text-subtle)",
                textAlign: "right",
                fontStyle: "italic",
              }}
            >
              Ouvert le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")} — toujours là
            </div>

            {/* Actions */}
            <div
              style={{
                ...INSET,
                display: "flex",
                gap: 3,
                padding: "3px",
                backgroundColor: "var(--t-bg)",
                marginTop: "auto",
              }}
            >
              <button
                onClick={onEdit}
                style={{
                  ...RAISED,
                  flex: 1,
                  padding: "3px 0",
                  backgroundColor: "var(--t-bg)",
                  color: "var(--t-text)",
                  cursor: "pointer",
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-sm)",
                }}
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => onDelete(ticket.id)}
                style={{
                  ...RAISED,
                  padding: "3px 8px",
                  backgroundColor: "var(--t-bg)",
                  color: "#bb0000",
                  cursor: "pointer",
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-sm)",
                  fontWeight: "bold",
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fieldset helper ───────────────────────────────────────────────────────────

function Fieldset({ legend, children, style }: { legend: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <fieldset
      style={{
        border: "2px solid var(--t-border-dark)",
        borderTopColor: "var(--t-border-dark)",
        padding: "4px 6px 5px",
        margin: 0,
        ...style,
      }}
    >
      <legend
        style={{
          fontSize: "var(--t-text-base)",
          color: "var(--t-text-muted)",
          fontFamily: "var(--t-font-display)",
          padding: "0 3px",
          letterSpacing: "0.05em",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

// ── TicketReactions ───────────────────────────────────────────────────────────

type ReactionsMap = Record<string, { count: number; userIds: string[]; userNames: string[] }>;

function TicketReactions({
  ticketId,
  currentUserId,
  onReact,
}: {
  ticketId: number;
  currentUserId: string | null;
  onReact?: () => void;
}) {
  const [reactions, setReactions] = useState<ReactionsMap>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const fetchReactions = useCallback(async () => {
    const res = await fetch(`/api/gunther-board/${ticketId}/reactions`);
    if (res.ok) setReactions(await res.json());
  }, [ticketId]);

  useEffect(() => { fetchReactions(); }, [fetchReactions]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [pickerOpen]);

  async function toggleReaction(emoji: string) {
    if (!currentUserId || pending) return;
    setPending(emoji);
    setPickerOpen(false);
    // Optimistic update
    setReactions((prev) => {
      const copy = { ...prev };
      const entry = copy[emoji];
      if (entry?.userIds.includes(currentUserId)) {
        const next = { ...entry, count: entry.count - 1, userIds: entry.userIds.filter((id) => id !== currentUserId) };
        if (next.count === 0) { delete copy[emoji]; } else { copy[emoji] = next; }
      } else {
        copy[emoji] = {
          count: (entry?.count ?? 0) + 1,
          userIds: [...(entry?.userIds ?? []), currentUserId],
          userNames: entry?.userNames ?? [],
        };
      }
      return copy;
    });
    await fetch(`/api/gunther-board/${ticketId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    await fetchReactions();
    setPending(null);
    onReact?.();
  }

  const hasAny = Object.keys(reactions).length > 0;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3 }}>
      {/* Existing reactions */}
      {Object.entries(reactions).map(([emoji, data]) => {
        const mine = currentUserId ? data.userIds.includes(currentUserId) : false;
        const tip = data.userNames.length > 0 ? data.userNames.join(", ") : `${data.count} réaction(s)`;
        return (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            title={tip}
            disabled={!currentUserId || pending === emoji}
            style={{
              ...( mine ? INSET : RAISED),
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              padding: "1px 5px",
              fontSize: "var(--t-text-sm)",
              backgroundColor: mine ? "var(--t-card-hover)" : "var(--t-bg)",
              color: "var(--t-text)",
              cursor: currentUserId ? "pointer" : "default",
              fontFamily: "var(--t-font-display)",
              lineHeight: "16px",
              opacity: pending === emoji ? 0.5 : 1,
            }}
          >
            {emoji} <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>{data.count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      {currentUserId && (
        <div style={{ position: "relative" }} ref={pickerRef}>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            title={hasAny ? "Ajouter une réaction" : "Réagir à ce ticket"}
            style={{
              ...RAISED,
              padding: "1px 5px",
              fontSize: "var(--t-text-sm)",
              backgroundColor: "var(--t-bg)",
              color: "var(--t-text-muted)",
              cursor: "pointer",
              fontFamily: "var(--t-font-display)",
              lineHeight: "16px",
            }}
          >
            {hasAny ? "+" : "😶 Réagir"}
          </button>

          {pickerOpen && (
            <div
              style={{
                ...RAISED,
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: 0,
                backgroundColor: "var(--t-bg)",
                padding: "4px",
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                zIndex: 100,
                width: 160,
                boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
              }}
            >
              {ALLOWED_EMOJIS.map((emoji) => {
                const mine = reactions[emoji]?.userIds.includes(currentUserId) ?? false;
                return (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(emoji)}
                    title={emoji}
                    style={{
                      ...(mine ? INSET : RAISED),
                      padding: "2px 4px",
                      fontSize: "var(--t-text-base)",
                      backgroundColor: mine ? "var(--t-card-hover)" : "var(--t-bg)",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── NewTicketModal ─────────────────────────────────────────────────────────────

function NewTicketModal({
  form,
  submitting,
  users,
  currentUser,
  onChange,
  onSubmit,
  onClose,
}: {
  form: NewTicketForm;
  submitting: boolean;
  users: GunthUser[];
  currentUser: { id: string; name: string } | null;
  onChange: (patch: Partial<NewTicketForm>) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSubmit();
  }

  const fieldStyle: React.CSSProperties = {
    ...INSET,
    width: "100%",
    padding: "3px 5px",
    backgroundColor: "var(--t-app-bg)",
    color: "var(--t-text)",
    fontFamily: "var(--t-font-display)",
    fontSize: "var(--t-text-sm)",
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 50 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        onKeyDown={handleKey}
        style={{
          ...RAISED,
          backgroundColor: "var(--t-bg)",
          width: 400,
          fontFamily: "var(--t-font-display)",
          fontSize: "var(--t-text-sm)",
          color: "var(--t-text)",
          boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
        }}
      >
        {/* Titlebar */}
        <div
          className="flex items-center justify-between px-2"
          style={{
            background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "var(--t-text-sm)",
            height: 22,
          }}
        >
          <span>📋 Nouveau ticket — GuntherBoard™</span>
          <button
            onClick={onClose}
            style={{
              ...RAISED,
              background: "var(--t-bg)",
              color: "var(--t-text)",
              cursor: "pointer",
              fontSize: "var(--t-text-xs)",
              fontWeight: "bold",
              width: 16,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0,
              fontFamily: "var(--t-font-display)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Separator */}
        <div style={{ height: 2, backgroundColor: "var(--t-border-dark)" }} />

        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
          <Fieldset legend="Titre *">
            <input
              autoFocus
              value={form.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Ex: Le Solitaire crashe exactement à 98% de victoire"
              style={fieldStyle}
            />
          </Fieldset>

          <Fieldset legend="Description">
            <textarea
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              placeholder="Étapes pour reproduire... (optionnel, mais ça aide quand même)"
              style={{ ...fieldStyle, resize: "none" }}
            />
          </Fieldset>

          <div style={{ display: "flex", gap: 8 }}>
            <Fieldset legend="Priorité" style={{ flex: 1 }}>
              <select
                value={form.priority}
                onChange={(e) => onChange({ priority: e.target.value as Priority })}
                style={fieldStyle}
              >
                <option value="low">Pas urgent (sauf si ça l&apos;est)</option>
                <option value="medium">Moyen (comme toujours)</option>
                <option value="high">Élevé (vraiment cette fois)</option>
                <option value="critical">🚨 PANIQUE</option>
              </select>
            </Fieldset>
            <Fieldset legend="Label" style={{ flex: 1 }}>
              <select
                value={form.label}
                onChange={(e) => onChange({ label: e.target.value as Label | "" })}
                style={fieldStyle}
              >
                <option value="">— sans étiquette —</option>
                <option value="bug">🐛 bug (encore)</option>
                <option value="feature">✨ feature</option>
                <option value="chore">🔧 corvée</option>
                <option value="ui">🎨 esthétique</option>
                <option value="audio">🔊 bruit suspect</option>
                <option value="db">🗄️ bdd (touchez pas)</option>
              </select>
            </Fieldset>
          </div>

          <Fieldset legend="Scope">
            <ScopeSelect
              value={form.scope}
              onChange={(v) => onChange({ scope: v })}
              style={fieldStyle}
            />
          </Fieldset>

          <Fieldset legend="Assigné à">
            <div style={{ display: "flex", gap: 4 }}>
              <select
                value={form.assigneeId}
                onChange={(e) => onChange({ assigneeId: e.target.value })}
                style={{ ...fieldStyle, flex: 1, width: "auto" }}
              >
                <option value="">— à voir —</option>
                {currentUser && <option value={currentUser.id}>👤 {currentUser.name} (moi, hélas)</option>}
                {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                  <option key={u.id} value={u.id}>👤 {u.name}</option>
                ))}
              </select>
              {currentUser && form.assigneeId !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => onChange({ assigneeId: currentUser.id })}
                  title="Vous assigner ça volontairement"
                  style={{
                    ...RAISED,
                    padding: "3px 6px",
                    backgroundColor: "var(--t-bg)",
                    color: "var(--t-text)",
                    cursor: "pointer",
                    fontFamily: "var(--t-font-display)",
                    fontSize: "var(--t-text-sm)",
                    whiteSpace: "nowrap",
                  }}
                >
                  ← moi
                </button>
              )}
            </div>
          </Fieldset>

          {/* Divider */}
          <div
            style={{
              borderTop: "2px solid var(--t-border-dark)",
              borderBottom: "1px solid var(--t-border-light)",
              margin: "2px -12px",
            }}
          />

          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                ...RAISED,
                padding: "3px 14px",
                backgroundColor: "var(--t-bg)",
                color: "var(--t-text)",
                cursor: "pointer",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-sm)",
              }}
            >
              Annuler
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting || !form.title.trim()}
              style={{
                ...RAISED,
                padding: "3px 14px",
                backgroundColor: form.title.trim() ? "var(--t-accent)" : "var(--t-bg)",
                color: form.title.trim() ? "#fff" : "var(--t-text-muted)",
                cursor: form.title.trim() ? "pointer" : "not-allowed",
                fontFamily: "var(--t-font-display)",
                fontSize: "var(--t-text-sm)",
                fontWeight: "bold",
              }}
            >
              {submitting ? "En cours d'envoi..." : "✔ Signaler ce problème"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
