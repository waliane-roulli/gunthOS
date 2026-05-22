"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/contexts/auth-context";

const LS_KEY = "gunth_seen_apps";

function loadFromLocalStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveToLocalStorage(seen: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...seen]));
  } catch {}
}

async function fetchSeenAppsFromApi(): Promise<string[]> {
  const r = await fetch("/api/user/settings");
  if (!r.ok) return [];
  const data = (await r.json()) as { settings: { seenApps?: string[] } | null };
  return data.settings?.seenApps ?? [];
}

async function pushSeenAppsToApi(seenApps: string[]) {
  await fetch("/api/user/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seenApps }),
  });
}

interface SeenAppsContextValue {
  seen: Set<string>;
  markSeen: (slug: string) => void;
}

const SeenAppsContext = createContext<SeenAppsContextValue>({
  seen: new Set(),
  markSeen: () => {},
});

export function SeenAppsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    setSeen(loadFromLocalStorage());
  }, []);

  useEffect(() => {
    if (!user) {
      prevUserIdRef.current = null;
      return;
    }
    if (prevUserIdRef.current === user.id) return;
    prevUserIdRef.current = user.id;

    (async () => {
      const local = loadFromLocalStorage();
      const remote = await fetchSeenAppsFromApi().catch(() => [] as string[]);
      const merged = new Set([...local, ...remote]);

      setSeen(merged);
      saveToLocalStorage(merged);

      const hasNew = [...local].some((s) => !remote.includes(s));
      if (hasNew) {
        await pushSeenAppsToApi([...merged]).catch(() => {});
      }
    })();
  }, [user]);

  const markSeen = useCallback((slug: string) => {
    setSeen((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev).add(slug);
      saveToLocalStorage(next);
      if (prevUserIdRef.current) {
        pushSeenAppsToApi([...next]).catch(() => {});
      }
      return next;
    });
  }, []);

  return (
    <SeenAppsContext.Provider value={{ seen, markSeen }}>
      {children}
    </SeenAppsContext.Provider>
  );
}

export function useSeenApps() {
  return useContext(SeenAppsContext);
}
