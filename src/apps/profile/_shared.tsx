"use client";

import { useState, useRef } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
import { useWastedTime, formatWastedTime } from "@/lib/hooks/use-wasted-time";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ProfileData {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  bio: string | null;
  statusMessage: string | null;
  avatarDataUrl: string | null;
  favoriteApp: string | null;
  gunthosRank: string | null;
  createdAt: Date | string | null;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

export const GUNTHOS_RANKS = [
  { threshold: 0,   rank: "🥚 Newbie (vient d'installer GunthOS)", icon: "🥚" },
  { threshold: 7,   rank: "🐣 Utilisateur confirmé (a survécu au boot)", icon: "🐣" },
  { threshold: 30,  rank: "💾 Vétéran 56K (a connu le modem)", icon: "💾" },
  { threshold: 90,  rank: "🖥️ Technicien GunthOS (a soufflé dans la cartouche)", icon: "🖥️" },
  { threshold: 180, rank: "⚙️ Gourou du Registre (ne sait pas quoi ça fait)", icon: "⚙️" },
  { threshold: 365, rank: "🏆 Légende du Disque Dur (déconnecté depuis 1998)", icon: "🏆" },
];

export const FAVORITE_APPS = [
  { value: "solitaire", label: "🃏 Solitaire", desc: "Le classique. Tu perds à chaque fois." },
  { value: "defrag", label: "🗂️ Défragmenteur", desc: "La méditation du XXème siècle." },
  { value: "notepad", label: "📝 Bloc-notes", desc: "Sans sauvegarde depuis 2001." },
  { value: "ie", label: "🌐 Internet Explorer", desc: "Le navigateur du courage." },
  { value: "printer", label: "🖨️ Imprimante", desc: "Hors ligne depuis l'usine." },
  { value: "plouf-plouf", label: "💧 Plouf Plouf", desc: "Le tirage au sort façon Web 1.0." },
];

export const STATUS_SUGGESTIONS = [
  "En train de défragmenter depuis 3h",
  "AFK — Lecteur CD ouvert",
  "Connexion 56K instable",
  "Solitaire en cours (impossible de gagner)",
  "Mise à jour en attente depuis 2003",
  "PID 666 en cours d'arrêt",
  "Écran de veille activé",
  "Disque presque plein (98%)",
  "En vacances sur GeoCities",
  "Erreur générale de protection. Mais ça va.",
];

export const BIO_SUGGESTIONS = [
  "Utilisateur GunthOS certifié. N'a jamais réussi à éteindre correctement.",
  "Amateur de défrag, de solitaire et de sons de modem 56K.",
  "Survivant de l'écran bleu de la mort depuis 1998.",
  "Je souffles dans les cartouches avant de les insérer.",
  "640Ko de RAM ? Plus qu'il n'en faut.",
];

const PROFILE_COMPLIMENTS = [
  "Votre profil est 12% plus populaire que votre disquette de sauvegarde.",
  "Votre photo de profil consomme 847 Ko de mémoire vive.",
  "Statut du profil : STABLE (pour l'instant).",
  "Aucune erreur ActiveX détectée sur votre profil.",
  "Votre profil a été analysé par GunthAV™. Résultat : humain.",
  "Profil sauvegardé dans C:\\USERS\\VOUS\\BACKUP\\FINAL_V2.txt",
];

export const PIXEL_AVATARS = ["👾", "🤖", "👻", "🦄", "🐱", "🐸", "🦊", "🐺", "🐻", "🦁", "🐼", "🐨", "🦝", "🐙", "🦋"];

// ── Utilitaires ────────────────────────────────────────────────────────────────

export function getDaysSinceJoin(createdAt: Date | string | null): number {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

export function getGunthosRank(days: number) {
  let rank = GUNTHOS_RANKS[0]!;
  for (const r of GUNTHOS_RANKS) {
    if (days >= r.threshold) rank = r;
  }
  return rank;
}

export function resizeImageToDataUrl(file: File, maxPx = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image invalide")); };
    img.src = url;
  });
}

// ── Sous-composants UI ─────────────────────────────────────────────────────────

export function RetroBtn({
  children, onClick, disabled, variant = "normal",
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "normal" | "primary" | "danger";
}) {
  const [pressed, setPressed] = useState(false);
  const base: React.CSSProperties = {
    fontFamily: "var(--t-font-display)", fontSize: "0.875rem", letterSpacing: "0.05em",
    cursor: disabled ? "not-allowed" : "pointer", padding: "4px 14px", border: "2px solid", opacity: disabled ? 0.5 : 1,
    background: variant === "primary" ? "linear-gradient(180deg, var(--t-titlebar-from), var(--t-titlebar-to))" : "var(--t-bg)",
    color: variant === "primary" ? "var(--t-titlebar-text)" : variant === "danger" ? "var(--t-defrag-fragmented, #cc2200)" : "var(--t-text)",
    borderTopColor: pressed ? "var(--t-border-dark)" : "var(--t-border-light)",
    borderLeftColor: pressed ? "var(--t-border-dark)" : "var(--t-border-light)",
    borderBottomColor: pressed ? "var(--t-border-light)" : "var(--t-border-dark)",
    borderRightColor: pressed ? "var(--t-border-light)" : "var(--t-border-dark)",
    position: "relative", top: pressed ? "1px" : "0", transition: "top 0.04s",
  };
  return (
    <button style={base} onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

export function RetroInput({
  value, onChange, placeholder, maxLength, multiline, rows,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; multiline?: boolean; rows?: number;
}) {
  const base: React.CSSProperties = {
    fontFamily: "var(--t-font-display)", fontSize: "0.875rem",
    backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)",
    border: "2px solid",
    borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
    borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
    padding: "4px 6px", width: "100%", outline: "none", resize: "none",
  };
  if (multiline) {
    return <textarea style={base} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={rows ?? 3} spellCheck={false} />;
  }
  return <input style={base} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} />;
}

export function AvatarBlock({
  avatarDataUrl, pixelEmoji, editable, onUpload, onDelete, uploading,
}: {
  avatarDataUrl: string | null; pixelEmoji: string; editable: boolean;
  onUpload?: (file: File) => void; onDelete?: () => void; uploading?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: 88, height: 88, border: "3px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-app-bg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {avatarDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarDataUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
        ) : (
          <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>{pixelEmoji}</span>
        )}
        {uploading && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--t-font-display)", color: "#c0c0c0", fontSize: "0.75rem" }}>⏳</div>
        )}
      </div>
      {editable && (
        <div className="flex flex-col items-center gap-1">
          <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f && onUpload) onUpload(f); e.target.value = ""; }} />
          <RetroBtn onClick={() => fileRef.current?.click()} disabled={uploading}>📷 Changer</RetroBtn>
          {avatarDataUrl && <RetroBtn onClick={onDelete} variant="danger" disabled={uploading}>🗑️ Supprimer</RetroBtn>}
        </div>
      )}
    </div>
  );
}

export function StatsBlock({ profile }: { profile: ProfileData }) {
  const days = getDaysSinceJoin(profile.createdAt);
  const rank = getGunthosRank(days);
  const wastedSeconds = useWastedTime();
  const defragCount = Math.floor(days * 0.7);
  const compliment = pickRandom(PROFILE_COMPLIMENTS);
  const favApp = FAVORITE_APPS.find((a) => a.value === profile.favoriteApp);
  return (
    <div className="flex flex-col gap-2" style={{ border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))", padding: "8px 10px" }}>
      <div className="text-xs tracking-widest font-bold pb-1 mb-1 border-b" style={{ color: "var(--t-accent)", borderColor: "var(--t-border-dark)", fontFamily: "var(--t-font-display)" }}>
        FICHE SYSTÈME GUNTH™
      </div>
      <StatRow icon="📅" label="Inscrit il y a" value={`${days} jour${days > 1 ? "s" : ""}`} />
      <StatRow icon="⏱️" label="Temps gaspillé" value={`${formatWastedTime(wastedSeconds)} sur GunthOS`} />
      <StatRow icon="🗂️" label="Défragmentations" value={`${defragCount} (toutes inutiles)`} />
      <StatRow icon="🏅" label="Rang GunthOS" value={rank.rank} />
      {favApp && <StatRow icon="⭐" label="App favorite" value={favApp.label} />}
      <div className="text-xs mt-1 pt-1 border-t italic" style={{ color: "var(--t-text-subtle, var(--t-text-muted))", fontFamily: "var(--t-font-display)", borderColor: "var(--t-border-dark)" }}>
        {compliment}
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm" style={{ fontFamily: "var(--t-font-display)" }}>
      <span>{icon}</span>
      <span style={{ color: "var(--t-text-muted)", minWidth: 130, flexShrink: 0 }}>{label} :</span>
      <span style={{ color: "var(--t-text)" }}>{value}</span>
    </div>
  );
}

export function ViewTab({ profile, pixelEmoji, isOwn }: { profile: ProfileData; pixelEmoji: string; isOwn?: boolean }) {
  const days = getDaysSinceJoin(profile.createdAt);
  const rank = getGunthosRank(days);
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-4 p-3 border-[2px]" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", background: "linear-gradient(135deg, var(--t-inset-from), var(--t-inset-to))" }}>
        <AvatarBlock avatarDataUrl={profile.avatarDataUrl} pixelEmoji={pixelEmoji} editable={false} />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl tracking-widest font-bold" style={{ color: "var(--t-accent)" }}>
              {profile.displayUsername ?? profile.username ?? profile.name}
            </span>
            <span className="text-xs px-1 border tracking-widest" style={{ borderColor: "var(--t-accent)", color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>{rank.icon}</span>
            {isOwn && <span className="text-xs px-1 border tracking-widest" style={{ borderColor: "var(--t-defrag-system, #008000)", color: "var(--t-defrag-system, #008000)" }}>C&apos;est vous</span>}
          </div>
          {profile.username && <div className="text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>@{profile.username}</div>}
          {profile.statusMessage && (
            <div className="text-sm tracking-wider mt-1 flex items-center gap-1" style={{ color: "var(--t-text)" }}>
              <span className="animate-[blink_1.5s_step-end_infinite]">●</span>
              <em>{profile.statusMessage}</em>
            </div>
          )}
          <div className="text-xs mt-auto" style={{ color: "var(--t-text-subtle, var(--t-text-muted))" }}>{rank.rank}</div>
        </div>
      </div>

      {profile.bio && (
        <div className="p-3 border-[2px] text-sm tracking-wide leading-relaxed" style={{ borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)", fontFamily: "var(--t-font-display)", whiteSpace: "pre-wrap" }}>
          <div className="text-xs tracking-widest mb-2 font-bold" style={{ color: "var(--t-text-muted)" }}>📄 À PROPOS (UNTITLED.TXT)</div>
          {profile.bio}
        </div>
      )}

      <StatsBlock profile={profile} />
      <DiskUsageBar days={days} />
    </div>
  );
}

function DiskUsageBar({ days }: { days: number }) {
  const pct = Math.min(97, 60 + days * 0.1);
  return (
    <div className="p-2 border-[2px] text-sm" style={{ borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", fontFamily: "var(--t-font-display)" }}>
      <div className="text-xs tracking-widest mb-1 flex justify-between" style={{ color: "var(--t-text-muted)" }}>
        <span>💾 C:\USERS\PROFIL — Espace utilisé</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 14, border: "2px solid", borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-app-bg)", padding: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct > 90 ? "repeating-linear-gradient(90deg, var(--t-defrag-fragmented,#cc2200) 0, var(--t-defrag-fragmented,#cc2200) 8px, #ff4444 8px, #ff4444 10px)" : "repeating-linear-gradient(90deg, var(--t-accent) 0, var(--t-accent) 8px, var(--t-titlebar-to,#1084d0) 8px, var(--t-titlebar-to,#1084d0) 10px)", transition: "width 1s ease" }} />
      </div>
      {pct > 90 && <div className="text-xs mt-1 animate-[blink_0.8s_step-end_infinite]" style={{ color: "var(--t-defrag-fragmented,#cc2200)" }}>⚠ Espace disque critique ! Supprimez votre bio.</div>}
    </div>
  );
}

export function FieldSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs tracking-widest font-bold" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{label}</div>
      {children}
    </div>
  );
}
