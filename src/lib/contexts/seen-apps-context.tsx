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
import { getAppManifest } from "@/apps";

const LS_KEY = "gunth_seen_apps";
const LS_VERSIONS_KEY = "gunth_seen_app_versions";

function loadSeenFromLocalStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveSeenToLocalStorage(seen: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...seen]));
  } catch {}
}

function loadVersionsFromLocalStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LS_VERSIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveVersionsToLocalStorage(versions: Record<string, string>) {
  try {
    localStorage.setItem(LS_VERSIONS_KEY, JSON.stringify(versions));
  } catch {}
}

// On first deploy of versioning: seed seenVersions from seen set so existing
// users don't get spurious "NEW" badges on apps they've already opened.
function seedVersionsFromSeen(
  seen: Set<string>,
  existing: Record<string, string>
): Record<string, string> {
  if (Object.keys(existing).length > 0) return existing;
  const seeded: Record<string, string> = {};
  for (const slug of seen) {
    const manifest = getAppManifest(slug);
    if (manifest?.version) seeded[slug] = manifest.version;
  }
  return seeded;
}

async function fetchUserVersions(): Promise<Record<string, string>> {
  const r = await fetch("/api/user/settings");
  if (!r.ok) return {};
  const data = (await r.json()) as { settings: { seenApps?: string[]; seenAppVersions?: Record<string, string> } | null };
  return data.settings?.seenAppVersions ?? {};
}

async function fetchSeenAppsFromApi(): Promise<string[]> {
  const r = await fetch("/api/user/settings");
  if (!r.ok) return [];
  const data = (await r.json()) as { settings: { seenApps?: string[] } | null };
  return data.settings?.seenApps ?? [];
}

async function pushToApi(seenApps: string[], seenAppVersions: Record<string, string>) {
  await fetch("/api/user/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seenApps, seenAppVersions }),
  });
}

interface SeenAppsContextValue {
  seen: Set<string>;
  seenVersions: Record<string, string>;
  markSeen: (slug: string, version?: string) => void;
  isNewVersion: (slug: string, version?: string) => boolean;
}

const SeenAppsContext = createContext<SeenAppsContextValue>({
  seen: new Set(),
  seenVersions: {},
  markSeen: () => {},
  isNewVersion: () => false,
});

export function SeenAppsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [seenVersions, setSeenVersions] = useState<Record<string, string>>({});
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const localSeen = loadSeenFromLocalStorage();
    const localVersions = loadVersionsFromLocalStorage();
    const seeded = seedVersionsFromSeen(localSeen, localVersions);
    setSeen(localSeen);
    setSeenVersions(seeded);
    if (Object.keys(seeded).length > Object.keys(localVersions).length) {
      saveVersionsToLocalStorage(seeded);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      prevUserIdRef.current = null;
      return;
    }
    if (prevUserIdRef.current === user.id) return;
    prevUserIdRef.current = user.id;

    (async () => {
      const localSeen = loadSeenFromLocalStorage();
      const localVersions = loadVersionsFromLocalStorage();

      const [remoteApps, remoteVersions] = await Promise.all([
        fetchSeenAppsFromApi().catch(() => [] as string[]),
        fetchUserVersions().catch(() => ({} as Record<string, string>)),
      ]);

      const mergedSeen = new Set([...localSeen, ...remoteApps]);
      // Take the lexicographically greater version per key to avoid regressing "seen" state
      // across devices (higher semver string = more recently opened).
      const mergedVersions: Record<string, string> = { ...localVersions };
      for (const [k, v] of Object.entries(remoteVersions)) {
        if (!mergedVersions[k] || v > mergedVersions[k]) mergedVersions[k] = v;
      }
      const seeded = seedVersionsFromSeen(mergedSeen, mergedVersions);

      setSeen(mergedSeen);
      setSeenVersions(seeded);
      saveSeenToLocalStorage(mergedSeen);
      saveVersionsToLocalStorage(seeded);

      const hasNewSeen = [...localSeen].some((s) => !remoteApps.includes(s));
      const hasNewVersions = Object.keys(seeded).some(
        (k) => remoteVersions[k] !== seeded[k]
      );
      if (hasNewSeen || hasNewVersions) {
        await pushToApi([...mergedSeen], seeded).catch(() => {});
      }
    })();
  }, [user]);

  const markSeen = useCallback((slug: string, version?: string) => {
    setSeen((prevSeen) => {
      const nextSeen = prevSeen.has(slug) ? prevSeen : new Set(prevSeen).add(slug);
      setSeenVersions((prevVersions) => {
        if (!version || prevVersions[slug] === version) {
          if (nextSeen === prevSeen) return prevVersions;
          saveSeenToLocalStorage(nextSeen);
          if (prevUserIdRef.current) {
            pushToApi([...nextSeen], prevVersions).catch(() => {});
          }
          return prevVersions;
        }
        const nextVersions = { ...prevVersions, [slug]: version };
        saveSeenToLocalStorage(nextSeen);
        saveVersionsToLocalStorage(nextVersions);
        if (prevUserIdRef.current) {
          pushToApi([...nextSeen], nextVersions).catch(() => {});
        }
        return nextVersions;
      });
      return nextSeen;
    });
  }, []);

  const isNewVersion = useCallback(
    (slug: string, version?: string): boolean => {
      if (!version) return false;
      return seenVersions[slug] !== version;
    },
    [seenVersions]
  );

  return (
    <SeenAppsContext.Provider value={{ seen, seenVersions, markSeen, isNewVersion }}>
      {children}
    </SeenAppsContext.Provider>
  );
}

export function useSeenApps() {
  return useContext(SeenAppsContext);
}
