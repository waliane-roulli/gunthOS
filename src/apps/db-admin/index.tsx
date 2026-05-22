"use client";

import { useEffect, useState } from "react";
import type { AppProps } from "@/types";

type UserRow = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  createdAt: number;
};

const cellStyle: React.CSSProperties = { padding: "6px 8px", verticalAlign: "middle" };

const btnStyle = (variant: "default" | "danger" | "admin" | "user" = "default"): React.CSSProperties => ({
  background: variant === "danger" ? "#c0392b" : variant === "admin" ? "var(--t-accent)" : "var(--t-bg)",
  border: "2px solid",
  borderTopColor: variant === "danger" || variant === "admin" ? "rgba(255,255,255,0.3)" : "var(--t-border-light)",
  borderLeftColor: variant === "danger" || variant === "admin" ? "rgba(255,255,255,0.3)" : "var(--t-border-light)",
  borderBottomColor: variant === "danger" || variant === "admin" ? "rgba(0,0,0,0.3)" : "var(--t-border-dark)",
  borderRightColor: variant === "danger" || variant === "admin" ? "rgba(0,0,0,0.3)" : "var(--t-border-dark)",
  fontFamily: "var(--t-font-body)",
  fontSize: "var(--t-text-xs)",
  color: variant === "danger" || variant === "admin" ? "#fff" : "var(--t-text)",
  padding: "2px 8px",
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
});

const inputStyle: React.CSSProperties = {
  background: "var(--t-app-bg)",
  border: "2px solid",
  borderTopColor: "var(--t-border-dark)",
  borderLeftColor: "var(--t-border-dark)",
  borderBottomColor: "var(--t-border-light)",
  borderRightColor: "var(--t-border-light)",
  color: "var(--t-text)",
  fontFamily: "var(--t-font-body)",
  fontSize: "var(--t-text-xs)",
  padding: "2px 6px",
  width: 160,
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span style={{
      background: role === "admin" ? "var(--t-accent)" : "var(--t-border-dark)",
      color: role === "admin" ? "var(--t-bg)" : "var(--t-text-muted)",
      padding: "1px 6px",
      fontSize: "var(--t-text-xs)",
      display: "inline-block",
      minWidth: 40,
      textAlign: "center",
    }}>
      {role}
    </span>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); });
  }

  useEffect(load, []);

  function setFb(id: string, msg: string) {
    setFeedback((f) => ({ ...f, [id]: msg }));
    setTimeout(() => setFeedback((f) => { const n = { ...f }; delete n[id]; return n; }), 3000);
  }

  async function toggleRole(u: UserRow) {
    setBusy(u.id);
    const next = u.role === "admin" ? "user" : "admin";
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setBusy(null);
    if (res.ok) {
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: next } : x));
      setFb(u.id, `✓ Rôle → ${next}`);
    } else {
      setFb(u.id, "Erreur");
    }
  }

  async function deleteUser(id: string) {
    setBusy(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusy(null);
    setConfirmDelete(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      setFb(id, "Erreur suppression");
    }
  }

  async function handleReset(userId: string) {
    const pwd = newPwd[userId] ?? "";
    if (pwd.length < 8) { setFb(userId, "8 caractères min"); return; }
    setBusy(userId);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newPassword: pwd }),
    });
    const data = await res.json();
    setBusy(null);
    setFb(userId, data.ok ? "✓ Mot de passe changé" : (data.error ?? "Erreur"));
    setNewPwd((p) => ({ ...p, [userId]: "" }));
  }

  if (loading) return (
    <div style={{ padding: 16, fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-sm)", color: "var(--t-text-muted)" }}>
      Chargement…
    </div>
  );

  return (
    <div style={{ height: "100%", overflow: "auto", background: "var(--t-bg)" }}>
      <div style={{ padding: "6px 10px", borderBottom: "1px solid var(--t-border-dark)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
          {users.length} utilisateur{users.length !== 1 ? "s" : ""}
        </span>
        <button style={btnStyle()} onClick={load}>↻ Rafraîchir</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--t-font-body)", fontSize: "var(--t-text-sm)" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--t-border-dark)", textAlign: "left", color: "var(--t-text-muted)" }}>
            <th style={cellStyle}>Username</th>
            <th style={cellStyle}>Email</th>
            <th style={cellStyle}>Rôle</th>
            <th style={cellStyle}>Inscrit le</th>
            <th style={cellStyle}>Reset mdp</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--t-border-dark)", color: "var(--t-text)" }}>
              <td style={cellStyle}>
                <span style={{ color: "var(--t-accent)" }}>{u.username ?? "—"}</span>
              </td>
              <td style={{ ...cellStyle, color: "var(--t-text-muted)" }}>{u.email}</td>
              <td style={cellStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <RoleBadge role={u.role} />
                  <button
                    style={btnStyle(u.role === "admin" ? "user" : "admin")}
                    disabled={busy === u.id}
                    onClick={() => toggleRole(u)}
                    title={u.role === "admin" ? "Rétrograder en user" : "Promouvoir admin"}
                  >
                    {u.role === "admin" ? "→ user" : "→ admin"}
                  </button>
                </div>
              </td>
              <td style={{ ...cellStyle, color: "var(--t-text-muted)", fontSize: "var(--t-text-xs)" }}>
                {new Date(u.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td style={cellStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="password"
                    placeholder="Nouveau mdp…"
                    value={newPwd[u.id] ?? ""}
                    onChange={(e) => setNewPwd((p) => ({ ...p, [u.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleReset(u.id)}
                    style={inputStyle}
                  />
                  <button style={btnStyle()} disabled={busy === u.id} onClick={() => handleReset(u.id)}>
                    {busy === u.id ? "…" : "Reset"}
                  </button>
                </div>
              </td>
              <td style={cellStyle}>
                {confirmDelete === u.id ? (
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>Confirmer ?</span>
                    <button style={btnStyle("danger")} disabled={busy === u.id} onClick={() => deleteUser(u.id)}>
                      {busy === u.id ? "…" : "Oui"}
                    </button>
                    <button style={btnStyle()} onClick={() => setConfirmDelete(null)}>Non</button>
                  </div>
                ) : (
                  <button style={btnStyle("danger")} onClick={() => setConfirmDelete(u.id)}>
                    Supprimer
                  </button>
                )}
                {feedback[u.id] && (
                  <span style={{ marginLeft: 6, fontSize: "var(--t-text-xs)", color: feedback[u.id]?.startsWith("✓") ? "var(--t-accent)" : "red" }}>
                    {feedback[u.id]}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DbAdmin({ windowId }: AppProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--t-bg)" }}>
      <div style={{
        padding: "4px 10px",
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-inset-from)",
        flexShrink: 0,
        fontFamily: "var(--t-font-body)",
        fontSize: "var(--t-text-xs)",
        color: "var(--t-text-muted)",
      }}>
        Admin — Gestion des utilisateurs
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <UsersPanel />
      </div>
    </div>
  );
}
