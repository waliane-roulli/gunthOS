"use client";

import { useState, useEffect, useMemo } from "react";
import { useWindowActions } from "@/lib/contexts/window-manager-context";
import { pickRandom, DIRECTORY_LOADING_MSGS, DIRECTORY_EMPTY_SEARCH_MSGS, DIRECTORY_NO_USERS_MSGS } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";
import { PIXEL_AVATARS, getDaysSinceJoin, getGunthosRank, RetroInput } from "@/apps/profile/_shared";

interface PublicUser {
  username: string | null;
  displayUsername: string | null;
  name: string;
  statusMessage: string | null;
  avatarDataUrl: string | null;
  createdAt: Date | string | null;
}

export function DirectoryApp(_: AppProps) {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadingMsg] = useState(() => pickRandom(DIRECTORY_LOADING_MSGS));
  const [emptySearchMsg] = useState(() => pickRandom(DIRECTORY_EMPTY_SEARCH_MSGS));
  const [noUsersMsg] = useState(() => pickRandom(DIRECTORY_NO_USERS_MSGS));
  const { openWindow } = useWindowActions();

  useEffect(() => {
    fetch("/api/profiles/list")
      .then((r) => r.json())
      .then((data: { users?: PublicUser[] }) => { if (data.users) setUsers(data.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pixelEmojis = useMemo(
    () => Object.fromEntries(users.map((u) => [u.username ?? u.name, pickRandom(PIXEL_AVATARS)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users.length]
  );

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.username ?? "").toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
  });

  function openProfile(username: string) {
    openWindow(`profile:${username}`, `Profil @${username}`, "👤");
  }

  if (loading) {
    return (
      <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <div className="text-4xl animate-[blink_1s_step-end_infinite]">⏳</div>
        <div className="mt-2 tracking-widest">{loadingMsg}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="p-2 border-b shrink-0 flex gap-2 items-center" style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
        <span style={{ color: "var(--t-text-muted)" }}>🔍</span>
        <RetroInput value={search} onChange={setSearch} placeholder="Rechercher un utilisateur..." />
      </div>

      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--t-text-muted)" }}>
            {search ? emptySearchMsg : noUsersMsg}
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((u) => {
              const key = u.username ?? u.name;
              const emoji = pixelEmojis[key] ?? PIXEL_AVATARS[0]!;
              const days = getDaysSinceJoin(u.createdAt);
              const rank = getGunthosRank(days);
              return (
                <button
                  key={key}
                  onDoubleClick={() => u.username && openProfile(u.username)}
                  onClick={(e) => { if (e.detail === 1) e.currentTarget.focus(); }}
                  className="flex items-center gap-3 px-3 py-2 border-b text-left cursor-default focus:outline-none"
                  style={{ borderColor: "var(--t-border-dark)", fontFamily: "var(--t-font-display)" }}
                  onFocus={(e) => { e.currentTarget.style.background = "var(--t-card-hover)"; }}
                  onBlur={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 40, height: 40, flexShrink: 0, border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-app-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {u.avatarDataUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={u.avatarDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "1.5rem" }}>{emoji}</span>}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider" style={{ color: "var(--t-text)" }}>{u.displayUsername ?? u.username ?? u.name}</span>
                      <span className="text-xs" style={{ color: "var(--t-text-muted)" }}>{rank.icon}</span>
                    </div>
                    {u.statusMessage && (
                      <div className="text-xs truncate" style={{ color: "var(--t-text-muted)" }}>
                        <span className="animate-[blink_2s_step-end_infinite]">●</span> {u.statusMessage}
                      </div>
                    )}
                  </div>
                  <div className="text-xs shrink-0" style={{ color: "var(--t-text-subtle, var(--t-text-muted))" }}>{days}j</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between" style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text-muted)", backgroundColor: "var(--t-bg)" }}>
        <span>{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</span>
        <span>Double-clic pour voir le profil</span>
      </div>
    </div>
  );
}
