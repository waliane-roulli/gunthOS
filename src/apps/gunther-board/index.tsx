"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { APP_REGISTRY } from "@/apps";
import type { AppProps } from "@/types";

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
  createdById: string | null;
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
        {APP_REGISTRY.filter((a) => a.slug !== "gunther-board").map((a) => (
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

const COLUMNS: { key: Status; label: string; icon: string; accentColor: string; emptyMsg: string }[] = [
  { key: "todo", label: "À FAIRE", icon: "📥", accentColor: "var(--t-text-muted)", emptyMsg: "Rien ici.\nProfitez-en." },
  { key: "in_progress", label: "EN COURS", icon: "⚙️", accentColor: "#c88a00", emptyMsg: "Personne ne travaille.\nC'est inhabituel." },
  { key: "done", label: "TERMINÉ", icon: "✅", accentColor: "#2a6e28", emptyMsg: "Aucun ticket terminé.\nNormal." },
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
  medium: "Moyen",
  high: "Élevé",
  critical: "🚨 PANIQUE",
};

const PRIORITY_LABELS_LONG: Record<Priority, string> = {
  low: "Pas urgent (sauf si ça l'est)",
  medium: "Moyen (comme toujours)",
  high: "Élevé (vraiment cette fois)",
  critical: "🚨 PANIQUE",
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
  bug: "bug (encore)",
  feature: "feature",
  chore: "corvée",
  ui: "esthétique",
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
      };
      setTickets((prev) => prev.map((t) => t.id === enriched.id ? { ...t, ...enriched } : t));
      setSelectedTicket((prev) => prev ? { ...prev, ...enriched } : null);
      setEditingDetail(false);
    }
  }

  const byStatus = (s: Status) => tickets.filter((t) => t.status === s);

  const totalCount = tickets.length;
  const ticketCountLabel =
    totalCount === 0 ? "0 ticket — miracle" :
    totalCount > 20 ? `${totalCount} tickets — situation critique` :
    `${totalCount} ticket${totalCount !== 1 ? "s" : ""}`;

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
          <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--t-text)", marginBottom: 6 }}>
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
          <div style={{ fontSize: "0.72rem", color: "var(--t-text-muted)" }}>
            Synchronisation{".".repeat(loadDots)}
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--t-text-subtle)", fontStyle: "italic", marginTop: 4 }}>
            (Le serveur répond rarement du premier coup.)
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
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)", backgroundColor: "var(--t-bg)" }}>
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
              fontSize: "0.78rem",
              fontWeight: "bold",
              color: "var(--t-text)",
              letterSpacing: "0.04em",
            }}
          >
            📋 GuntherBoard™
          </span>
          <span
            style={{
              fontSize: "0.68rem",
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
            title={!user ? "Connectez-vous pour signaler vos problèmes (ou les nôtres)" : undefined}
            style={{
              ...RAISED,
              padding: "2px 10px",
              fontSize: "0.72rem",
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
            title="Rafraîchir"
            style={{
              ...RAISED,
              padding: "2px 7px",
              fontSize: "0.75rem",
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
                {/* Column header */}
                <div
                  style={{
                    borderBottom: "2px solid var(--t-border-dark)",
                    borderTop: "2px solid var(--t-border-light)",
                    padding: "4px 8px",
                    backgroundColor: "var(--t-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span style={{ fontSize: "0.8rem" }}>{col.icon}</span>
                    <span
                      style={{
                        fontSize: "0.68rem",
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
                      fontSize: "0.68rem",
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
                        fontSize: "0.63rem",
                        color: "var(--t-text-subtle)",
                        fontStyle: "italic",
                        whiteSpace: "pre-line",
                        lineHeight: 1.6,
                      }}
                    >
                      {isOver && !sameCol ? "📥 Déposer ici" : col.emptyMsg}
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
      <div style={{ paddingLeft: 12, paddingRight: 8, paddingTop: 7, paddingBottom: 6 }}>

        {/* Top row: title + id */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginBottom: 5 }}>
          <span
            style={{
              fontWeight: "bold",
              lineHeight: 1.35,
              flex: 1,
              fontSize: "0.75rem",
              color: "var(--t-text)",
            }}
          >
            {ticket.title}
          </span>
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--t-text-subtle)",
              whiteSpace: "nowrap",
              fontStyle: "italic",
              marginTop: 1,
              flexShrink: 0,
            }}
          >
            #{ticket.id}
          </span>
        </div>

        {/* Badges row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 5 }}>
          <span
            style={{
              fontSize: "0.6rem",
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
                fontSize: "0.6rem",
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
                padding: "1px 5px",
                fontSize: "0.58rem",
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

        {/* Assignee */}
        {ticket.assigneeName && (
          <div
            style={{
              fontSize: "0.62rem",
              color: "var(--t-text-muted)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ opacity: 0.6 }}>👤</span>
            <span>{ticket.assigneeName}</span>
          </div>
        )}

        {/* Action row — séparateur + boutons */}
        <div
          style={{
            borderTop: "1px solid var(--t-border-dark)",
            marginTop: ticket.assigneeName ? 0 : 2,
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
              title="Reculer"
              style={{
                ...RAISED,
                fontSize: "0.65rem",
                padding: "1px 7px",
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
            <span style={{ width: 22 }} />
          )}

          {next ? (
            <button
              onClick={() => onMove(ticket.id, next)}
              title="Avancer"
              style={{
                ...RAISED,
                fontSize: "0.65rem",
                padding: "1px 7px",
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
            <span style={{ width: 22 }} />
          )}

          <div style={{ flex: 1 }} />

          <button
            onClick={() => onDelete(ticket.id)}
            title="Supprimer"
            style={{
              background: "none",
              border: "none",
              fontSize: "0.65rem",
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
    fontSize: "0.72rem",
    width: "100%",
  };

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        ...INSET,
        width: 272,
        backgroundColor: "var(--t-app-bg)",
        fontSize: "0.72rem",
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
          fontSize: "0.7rem",
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
            fontSize: "0.65rem",
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
                  <option value="">— non assigné —</option>
                  {currentUser && <option value={currentUser.id}>👤 {currentUser.name} (moi)</option>}
                  {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                    <option key={u.id} value={u.id}>👤 {u.name}</option>
                  ))}
                </select>
                {currentUser && (detailForm.assigneeId ?? ticket.assigneeId) !== currentUser.id && (
                  <button
                    onClick={() => onChange({ assigneeId: currentUser.id })}
                    title="M'assigner"
                    style={{
                      ...RAISED,
                      padding: "2px 5px",
                      backgroundColor: "var(--t-bg)",
                      color: "var(--t-text)",
                      cursor: "pointer",
                      fontFamily: "var(--t-font-display)",
                      fontSize: "0.65rem",
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
                  fontSize: "0.7rem",
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
                  fontSize: "0.7rem",
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
                fontSize: "0.78rem",
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
                  fontSize: "0.62rem",
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
                    fontSize: "0.62rem",
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
                    fontSize: "0.6rem",
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
                    fontSize: "0.68rem",
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
                    fontSize: "0.66rem",
                  }}
                >
                  Pas de description. Bonne chance.
                </div>
              )}
            </Fieldset>

            {/* Assignee */}
            <Fieldset legend="Assigné à">
              <div
                style={{
                  ...INSET,
                  padding: "3px 6px",
                  backgroundColor: "var(--t-app-bg)",
                  fontSize: "0.68rem",
                  color: ticket.assigneeName ? "var(--t-text)" : "var(--t-text-subtle)",
                }}
              >
                {ticket.assigneeName ? (
                  <span>👤 {ticket.assigneeName}{ticket.assigneeUsername ? ` @${ticket.assigneeUsername}` : ""}</span>
                ) : currentUser ? (
                  <button
                    onClick={onEdit}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--t-accent)",
                      cursor: "pointer",
                      fontFamily: "var(--t-font-display)",
                      fontSize: "0.68rem",
                      padding: 0,
                    }}
                  >
                    + S&apos;assigner
                  </button>
                ) : (
                  <span style={{ fontStyle: "italic" }}>Non assigné</span>
                )}
              </div>
            </Fieldset>

            {/* Date */}
            <div
              style={{
                fontSize: "0.6rem",
                color: "var(--t-text-subtle)",
                textAlign: "right",
                fontStyle: "italic",
              }}
            >
              Créé le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
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
                  fontSize: "0.7rem",
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
                  fontSize: "0.7rem",
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
          fontSize: "0.6rem",
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
    fontSize: "0.75rem",
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
          fontSize: "0.75rem",
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
            fontSize: "0.72rem",
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
              fontSize: "0.65rem",
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
              placeholder="Ex: Le Solitaire crashe à 98% de victoire"
              style={fieldStyle}
            />
          </Fieldset>

          <Fieldset legend="Description">
            <textarea
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              placeholder="Étapes pour reproduire... (ça servira sûrement à rien mais quand même)"
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
                <option value="">— non assigné —</option>
                {currentUser && <option value={currentUser.id}>👤 {currentUser.name} (moi)</option>}
                {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                  <option key={u.id} value={u.id}>👤 {u.name}</option>
                ))}
              </select>
              {currentUser && form.assigneeId !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => onChange({ assigneeId: currentUser.id })}
                  style={{
                    ...RAISED,
                    padding: "3px 6px",
                    backgroundColor: "var(--t-bg)",
                    color: "var(--t-text)",
                    cursor: "pointer",
                    fontFamily: "var(--t-font-display)",
                    fontSize: "0.7rem",
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
                fontSize: "0.75rem",
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
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {submitting ? "Envoi..." : "✔ Créer le ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
