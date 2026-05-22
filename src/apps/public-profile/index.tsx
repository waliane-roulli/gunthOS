"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { pickRandom, PUBLIC_PROFILE_LOADING_MSGS, PUBLIC_PROFILE_NOT_FOUND_MSGS } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";
import { type ProfileData, PIXEL_AVATARS, ViewTab } from "@/apps/profile/_shared";

export function PublicProfileWindow({ windowId }: AppProps) {
  const username = windowId.startsWith("profile:") ? windowId.slice("profile:".length) : windowId;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelEmoji] = useState(() => pickRandom(PIXEL_AVATARS));
  const [loadingMsg] = useState(() => pickRandom(PUBLIC_PROFILE_LOADING_MSGS));
  const [notFoundMsg] = useState(() => pickRandom(PUBLIC_PROFILE_NOT_FOUND_MSGS));
  const { user: me } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/profiles?username=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((data: { profile?: ProfileData; error?: string }) => {
        if (data.error) setError(data.error);
        else if (data.profile) setProfile(data.profile);
      })
      .catch(() => setError("Erreur réseau — vérifiez votre câble RJ-45."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <div className="text-4xl mb-3 animate-[blink_1s_step-end_infinite]">⏳</div>
        <div className="tracking-widest">Chargement du profil de @{username}...</div>
        <div className="text-xs mt-1">{loadingMsg}</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 flex flex-col items-center gap-3" style={{ fontFamily: "var(--t-font-display)" }}>
        <div className="text-5xl">🚫</div>
        <div className="text-xl tracking-widest" style={{ color: "var(--t-accent)" }}>PROFIL INTROUVABLE</div>
        <div className="text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>{error ?? "Secteur disque corrompu."}</div>
        <div className="text-xs" style={{ color: "var(--t-text-subtle, var(--t-text-muted))" }}>@{username} {notFoundMsg}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="flex-1 overflow-auto">
        <ViewTab profile={profile} pixelEmoji={pixelEmoji} isOwn={me?.username === profile.username} />
      </div>
      <div className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between" style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text-muted)", backgroundColor: "var(--t-bg)" }}>
        <span>Profil public de @{profile.username}</span>
        <span>GunthProfil™ v1.0</span>
      </div>
    </div>
  );
}
