"use client";

import { useEffect, useState } from "react";
import type { AppProps } from "@/types";

type Tab = "studio" | "users";

type UserRow = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  createdAt: number;
};

function UsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  async function handleReset(userId: string) {
    const pwd = newPwd[userId] ?? "";
    if (pwd.length < 8) {
      setFeedback((f) => ({ ...f, [userId]: "8 caractères minimum" }));
      return;
    }
    setResetting(userId);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newPassword: pwd }),
    });
    const data = await res.json();
    setResetting(null);
    setFeedback((f) => ({ ...f, [userId]: data.ok ? "✓ Mot de passe mis à jour" : (data.error ?? "Erreur") }));
    setNewPwd((p) => ({ ...p, [userId]: "" }));
  }

  const panelStyle: React.CSSProperties = {
    height: "100%",
    overflow: "auto",
    background: "var(--t-bg)",
    padding: 12,
    fontFamily: "var(--t-font-body)",
    fontSize: "var(--t-text-sm)",
    color: "var(--t-text)",
  };

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
    width: 180,
  };

  const btnStyle: React.CSSProperties = {
    background: "var(--t-bg)",
    border: "2px solid",
    borderTopColor: "var(--t-border-light)",
    borderLeftColor: "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
    fontFamily: "var(--t-font-body)",
    fontSize: "var(--t-text-xs)",
    color: "var(--t-text)",
    padding: "2px 10px",
    cursor: "pointer",
  };

  if (loading) return <div style={panelStyle}>Chargement…</div>;

  return (
    <div style={panelStyle}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--t-border-dark)", textAlign: "left" }}>
            <th style={{ padding: "4px 8px" }}>Username</th>
            <th style={{ padding: "4px 8px" }}>Email</th>
            <th style={{ padding: "4px 8px" }}>Rôle</th>
            <th style={{ padding: "4px 8px" }}>Reset password</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--t-border-dark)" }}>
              <td style={{ padding: "6px 8px", color: "var(--t-accent)" }}>{u.username ?? "—"}</td>
              <td style={{ padding: "6px 8px", color: "var(--t-text-muted)" }}>{u.email}</td>
              <td style={{ padding: "6px 8px" }}>
                <span style={{
                  background: u.role === "admin" ? "var(--t-accent)" : "var(--t-border-dark)",
                  color: u.role === "admin" ? "var(--t-bg)" : "var(--t-text-muted)",
                  padding: "1px 6px",
                  fontSize: "var(--t-text-xs)",
                }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: "6px 8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="password"
                    placeholder="Nouveau mdp…"
                    value={newPwd[u.id] ?? ""}
                    onChange={(e) => setNewPwd((p) => ({ ...p, [u.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleReset(u.id)}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => handleReset(u.id)}
                    disabled={resetting === u.id}
                    style={btnStyle}
                  >
                    {resetting === u.id ? "…" : "Reset"}
                  </button>
                  {feedback[u.id] && (
                    <span style={{ fontSize: "var(--t-text-xs)", color: feedback[u.id]?.startsWith("✓") ? "var(--t-accent)" : "red" }}>
                      {feedback[u.id]}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DbAdmin({ windowId }: AppProps) {
  const [tab, setTab] = useState<Tab>("studio");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "3px 12px",
    fontFamily: "var(--t-font-body)",
    fontSize: "var(--t-text-xs)",
    color: active ? "var(--t-text)" : "var(--t-text-muted)",
    background: active ? "var(--t-bg)" : "var(--t-inset-from)",
    border: "2px solid",
    borderTopColor: active ? "var(--t-border-light)" : "var(--t-border-dark)",
    borderLeftColor: active ? "var(--t-border-light)" : "var(--t-border-dark)",
    borderBottomColor: active ? "var(--t-bg)" : "var(--t-border-dark)",
    borderRightColor: active ? "var(--t-border-dark)" : "var(--t-border-dark)",
    cursor: "pointer",
    marginBottom: active ? -2 : 0,
    position: "relative",
    zIndex: active ? 1 : 0,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--t-bg)" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        padding: "4px 8px 0",
        gap: 4,
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-inset-from)",
        flexShrink: 0,
      }}>
        <button style={tabStyle(tab === "studio")} onClick={() => setTab("studio")}>Drizzle Studio</button>
        <button style={tabStyle(tab === "users")} onClick={() => setTab("users")}>Users</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "studio" && (
          <>
            <div style={{
              padding: "3px 8px",
              background: "var(--t-inset-from)",
              borderBottom: "1px solid var(--t-border-dark)",
              fontFamily: "var(--t-font-body)",
              fontSize: "var(--t-text-xs)",
              color: "var(--t-text-muted)",
              flexShrink: 0,
            }}>
              Lance{" "}
              <code style={{ background: "var(--t-app-bg)", padding: "0 4px", border: "1px solid var(--t-border-dark)" }}>
                pnpm db:studio
              </code>{" "}
              si le panneau est vide · <span style={{ color: "var(--t-accent)" }}>localhost:4983</span>
            </div>
            <iframe
              src="http://localhost:4983"
              style={{ flex: 1, border: "none", width: "100%", display: "block" }}
              title="Drizzle Studio"
            />
          </>
        )}
        {tab === "users" && <UsersPanel />}
      </div>
    </div>
  );
}
