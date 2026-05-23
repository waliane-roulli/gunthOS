"use client";

import { useEffect, useState } from "react";
import type { AppProps, OsRelease } from "@/types";

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function ChangelogApp(_: AppProps) {
  const [releases, setReleases] = useState<OsRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/version")
      .then((r) => r.json())
      .then((d: { releases?: OsRelease[] }) => setReleases(d.releases ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = releases[0];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--t-bg)",
      fontFamily: "var(--t-font-body)",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px 10px",
        borderBottom: "2px solid var(--t-border-dark)",
        background: "var(--t-app-bg)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📋</span>
          <div>
            <div style={{
              fontFamily: "var(--t-font-display)",
              fontSize: "var(--t-text-md)",
              color: "var(--t-text)",
              letterSpacing: "0.05em",
            }}>
              GunthOS — Notes de version
            </div>
            <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)" }}>
              {loading ? "Chargement…" : latest ? `Dernière version : v${latest.version}` : "Aucune version publiée"}
            </div>
          </div>
        </div>
      </div>

      {/* Release list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && (
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted)", textAlign: "center", paddingTop: 32 }}>
            Chargement…
          </div>
        )}
        {!loading && releases.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 8,
            color: "var(--t-text-muted)",
            fontSize: "var(--t-text-sm)",
          }}>
            <span style={{ fontSize: 36 }}>📭</span>
            Aucune version publiée pour l'instant.
          </div>
        )}
        {releases.map((r, i) => (
          <div
            key={r.id}
            style={{
              border: "2px solid",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
              background: i === 0 ? "var(--t-app-bg)" : "var(--t-bg)",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              borderBottom: r.changelog ? "1px solid var(--t-border-dark)" : undefined,
              background: i === 0 ? "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))" : undefined,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i === 0 && (
                  <span style={{
                    fontSize: "var(--t-text-xs)",
                    background: "var(--t-accent)",
                    color: "#fff",
                    padding: "1px 6px",
                    fontFamily: "var(--t-font-display)",
                  }}>
                    LATEST
                  </span>
                )}
                <span style={{
                  fontFamily: "var(--t-font-display)",
                  fontSize: "var(--t-text-sm)",
                  color: i === 0 ? "var(--t-titlebar-text)" : "var(--t-accent)",
                  letterSpacing: "0.03em",
                }}>
                  v{r.version}
                </span>
              </div>
              <span style={{
                fontSize: "var(--t-text-xs)",
                color: i === 0 ? "rgba(255,255,255,0.7)" : "var(--t-text-muted)",
                fontFamily: "var(--t-font-body)",
              }}>
                {formatDate(r.releasedAt)}
              </span>
            </div>
            {r.changelog && (
              <div style={{
                padding: "8px 10px",
                fontSize: "var(--t-text-xs)",
                color: "var(--t-text)",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}>
                {r.changelog}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "5px 14px",
        borderTop: "2px solid var(--t-border-dark)",
        fontSize: "var(--t-text-xs)",
        color: "var(--t-text-muted)",
        fontFamily: "var(--t-font-display)",
        flexShrink: 0,
        letterSpacing: "0.04em",
      }}>
        {releases.length} version{releases.length !== 1 ? "s" : ""} publiée{releases.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
