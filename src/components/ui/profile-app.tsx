"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { pickRandom } from "@/lib/gunth-jokes";
import { useWastedTime, formatWastedTime } from "@/lib/hooks/use-wasted-time";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProfileData {
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

// ── Constantes marrantes ───────────────────────────────────────────────────────

const GUNTHOS_RANKS = [
  { threshold: 0,   rank: "🥚 Newbie (vient d'installer GunthOS)", icon: "🥚" },
  { threshold: 7,   rank: "🐣 Utilisateur confirmé (a survécu au boot)", icon: "🐣" },
  { threshold: 30,  rank: "💾 Vétéran 56K (a connu le modem)", icon: "💾" },
  { threshold: 90,  rank: "🖥️ Technicien GunthOS (a soufflé dans la cartouche)", icon: "🖥️" },
  { threshold: 180, rank: "⚙️ Gourou du Registre (ne sait pas quoi ça fait)", icon: "⚙️" },
  { threshold: 365, rank: "🏆 Légende du Disque Dur (déconnecté depuis 1998)", icon: "🏆" },
];

const FAVORITE_APPS = [
  { value: "solitaire", label: "🃏 Solitaire", desc: "Le classique. Tu perds à chaque fois." },
  { value: "defrag", label: "🗂️ Défragmenteur", desc: "La méditation du XXème siècle." },
  { value: "notepad", label: "📝 Bloc-notes", desc: "Sans sauvegarde depuis 2001." },
  { value: "ie", label: "🌐 Internet Explorer", desc: "Le navigateur du courage." },
  { value: "printer", label: "🖨️ Imprimante", desc: "Hors ligne depuis l'usine." },
  { value: "plouf-plouf", label: "💧 Plouf Plouf", desc: "Le tirage au sort façon Web 1.0." },
];

const STATUS_SUGGESTIONS = [
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

const BIO_SUGGESTIONS = [
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

const PIXEL_AVATARS = ["👾", "🤖", "👻", "🦄", "🐱", "🐸", "🦊", "🐺", "🐻", "🦁", "🐼", "🐨", "🦝", "🐙", "🦋"];

// ── Utilitaires ────────────────────────────────────────────────────────────────

function getDaysSinceJoin(createdAt: Date | string | null): number {
  if (!createdAt) return 0;
  const d = new Date(createdAt);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function getGunthosRank(days: number) {
  let rank = GUNTHOS_RANKS[0]!;
  for (const r of GUNTHOS_RANKS) {
    if (days >= r.threshold) rank = r;
  }
  return rank;
}

function resizeImageToDataUrl(file: File, maxPx = 200): Promise<string> {
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

// ── Sous-composants ────────────────────────────────────────────────────────────

function RetroBtn({
  children,
  onClick,
  disabled,
  variant = "normal",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "normal" | "primary" | "danger";
}) {
  const [pressed, setPressed] = useState(false);
  const base: React.CSSProperties = {
    fontFamily: "var(--t-font-display)",
    fontSize: "0.875rem",
    letterSpacing: "0.05em",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "4px 14px",
    border: "2px solid",
    opacity: disabled ? 0.5 : 1,
    background: variant === "primary"
      ? "linear-gradient(180deg, var(--t-titlebar-from), var(--t-titlebar-to))"
      : "var(--t-bg)",
    color: variant === "primary" ? "var(--t-titlebar-text)" : variant === "danger" ? "var(--t-defrag-fragmented, #cc2200)" : "var(--t-text)",
    borderTopColor: pressed ? "var(--t-border-dark)" : "var(--t-border-light)",
    borderLeftColor: pressed ? "var(--t-border-dark)" : "var(--t-border-light)",
    borderBottomColor: pressed ? "var(--t-border-light)" : "var(--t-border-dark)",
    borderRightColor: pressed ? "var(--t-border-light)" : "var(--t-border-dark)",
    position: "relative",
    top: pressed ? "1px" : "0",
    transition: "top 0.04s",
  };
  return (
    <button
      style={base}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

function RetroInput({
  value,
  onChange,
  placeholder,
  maxLength,
  multiline,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}) {
  const base: React.CSSProperties = {
    fontFamily: "var(--t-font-display)",
    fontSize: "0.875rem",
    backgroundColor: "var(--t-app-bg)",
    color: "var(--t-app-text)",
    border: "2px solid",
    borderTopColor: "var(--t-border-dark)",
    borderLeftColor: "var(--t-border-dark)",
    borderBottomColor: "var(--t-border-light)",
    borderRightColor: "var(--t-border-light)",
    padding: "4px 6px",
    width: "100%",
    outline: "none",
    resize: "none",
  };
  if (multiline) {
    return (
      <textarea
        style={base}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows ?? 3}
        spellCheck={false}
      />
    );
  }
  return (
    <input
      style={base}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}

// ── Avatar component ────────────────────────────────────────────────────────────

function AvatarBlock({
  avatarDataUrl,
  pixelEmoji,
  editable,
  onUpload,
  onDelete,
  uploading,
}: {
  avatarDataUrl: string | null;
  pixelEmoji: string;
  editable: boolean;
  onUpload?: (file: File) => void;
  onDelete?: () => void;
  uploading?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar display */}
      <div
        style={{
          width: 88,
          height: 88,
          border: "3px solid",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
          backgroundColor: "var(--t-app-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {avatarDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarDataUrl}
            alt="Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }}
          />
        ) : (
          <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>{pixelEmoji}</span>
        )}
        {uploading && (
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--t-font-display)",
              color: "#c0c0c0",
              fontSize: "0.75rem",
            }}
          >
            ⏳
          </div>
        )}
      </div>

      {editable && (
        <div className="flex flex-col items-center gap-1">
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && onUpload) onUpload(f);
              e.target.value = "";
            }}
          />
          <RetroBtn onClick={() => fileRef.current?.click()} disabled={uploading}>
            📷 Changer
          </RetroBtn>
          {avatarDataUrl && (
            <RetroBtn onClick={onDelete} variant="danger" disabled={uploading}>
              🗑️ Supprimer
            </RetroBtn>
          )}
        </div>
      )}
    </div>
  );
}

// ── Stats block ────────────────────────────────────────────────────────────────

function StatsBlock({ profile }: { profile: ProfileData }) {
  const days = getDaysSinceJoin(profile.createdAt);
  const rank = getGunthosRank(days);
  const wastedSeconds = useWastedTime();
  const defragCount = Math.floor(days * 0.7);
  const compliment = pickRandom(PROFILE_COMPLIMENTS);

  const favApp = FAVORITE_APPS.find((a) => a.value === profile.favoriteApp);

  return (
    <div
      className="flex flex-col gap-2"
      style={{
        border: "2px solid",
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
        background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))",
        padding: "8px 10px",
      }}
    >
      <div
        className="text-xs tracking-widest font-bold pb-1 mb-1 border-b"
        style={{ color: "var(--t-accent)", borderColor: "var(--t-border-dark)", fontFamily: "var(--t-font-display)" }}
      >
        FICHE SYSTÈME GUNTH™
      </div>

      <StatRow icon="📅" label="Inscrit il y a" value={`${days} jour${days > 1 ? "s" : ""}`} />
      <StatRow icon="⏱️" label="Temps gaspillé" value={`${formatWastedTime(wastedSeconds)} sur GunthOS`} />
      <StatRow icon="🗂️" label="Défragmentations" value={`${defragCount} (toutes inutiles)`} />
      <StatRow icon="🏅" label="Rang GunthOS" value={rank.rank} />
      {favApp && <StatRow icon="⭐" label="App favorite" value={favApp.label} />}

      <div
        className="text-xs mt-1 pt-1 border-t italic"
        style={{ color: "var(--t-text-subtle, var(--t-text-muted))", fontFamily: "var(--t-font-display)", borderColor: "var(--t-border-dark)" }}
      >
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

// ── ProfileApp (mon profil — éditable) ────────────────────────────────────────

export function ProfileApp() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"view" | "edit">("view");

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editFavoriteApp, setEditFavoriteApp] = useState("");

  const [pixelEmoji] = useState(() => pickRandom(PIXEL_AVATARS));

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json() as { profile: ProfileData };
      setProfile(data.profile);
      setEditName(data.profile.name ?? "");
      setEditBio(data.profile.bio ?? "");
      setEditStatus(data.profile.statusMessage ?? "");
      setEditFavoriteApp(data.profile.favoriteApp ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          statusMessage: editStatus,
          favoriteApp: editFavoriteApp,
        }),
      });
      setSaveMsg("✅ Sauvegardé dans C:\\USERS\\MOI\\PROFIL.txt");
      await loadProfile();
      setTab("view");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 200);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setSaveMsg(`❌ ${json.error ?? "Erreur upload"}`);
      } else {
        await loadProfile();
        setSaveMsg("📷 Photo de profil mise à jour !");
      }
    } finally {
      setUploading(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  async function handleAvatarDelete() {
    setUploading(true);
    try {
      await fetch("/api/user/avatar", { method: "DELETE" });
      await loadProfile();
      setSaveMsg("🗑️ Photo supprimée. L'emoji reste.");
    } finally {
      setUploading(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  }

  if (!user) {
    return (
      <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <div className="text-4xl mb-3">🔒</div>
        <div className="tracking-widest">Vous devez être connecté pour voir votre profil.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <div className="text-4xl mb-3 animate-[blink_1s_step-end_infinite]">⏳</div>
        <div className="tracking-widest">Chargement du profil depuis le disque dur...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-defrag-fragmented, #cc2200)" }}>
        <div className="text-4xl mb-3">💥</div>
        <div className="tracking-widest">Profil introuvable. Secteur disque corrompu.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      {/* Tab bar */}
      <div
        className="flex border-b shrink-0"
        style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg-dark)" }}
      >
        {(["view", "edit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 text-sm tracking-widest border-r"
            style={{
              fontFamily: "var(--t-font-display)",
              borderColor: "var(--t-border-dark)",
              background: tab === t ? "var(--t-bg)" : "transparent",
              color: tab === t ? "var(--t-text)" : "var(--t-text-muted)",
              borderBottom: tab === t ? "2px solid var(--t-bg)" : "none",
              marginBottom: tab === t ? -1 : 0,
              cursor: "pointer",
            }}
          >
            {t === "view" ? "👤 Mon profil" : "✏️ Modifier"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "view" ? (
          <ViewTab profile={profile} pixelEmoji={pixelEmoji} isOwn />
        ) : (
          <EditTab
            profile={profile}
            pixelEmoji={pixelEmoji}
            editName={editName} setEditName={setEditName}
            editBio={editBio} setEditBio={setEditBio}
            editStatus={editStatus} setEditStatus={setEditStatus}
            editFavoriteApp={editFavoriteApp} setEditFavoriteApp={setEditFavoriteApp}
            saving={saving} uploading={uploading}
            onSave={handleSave}
            onAvatarUpload={handleAvatarUpload}
            onAvatarDelete={handleAvatarDelete}
          />
        )}
      </div>

      {/* Status bar */}
      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between"
        style={{
          borderColor: "var(--t-border-dark)",
          color: saveMsg ? "var(--t-accent)" : "var(--t-text-muted)",
          backgroundColor: "var(--t-bg)",
        }}
      >
        <span>{saveMsg ?? `Profil de ${profile.displayUsername ?? profile.username ?? profile.name}`}</span>
        <span>GunthProfil™ v1.0</span>
      </div>
    </div>
  );
}

// ── View Tab ─────────────────────────────────────────────────────────────────

function ViewTab({ profile, pixelEmoji, isOwn }: { profile: ProfileData; pixelEmoji: string; isOwn?: boolean }) {
  const days = getDaysSinceJoin(profile.createdAt);
  const rank = getGunthosRank(days);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header card */}
      <div
        className="flex gap-4 p-3 border-[2px]"
        style={{
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
          background: "linear-gradient(135deg, var(--t-inset-from), var(--t-inset-to))",
        }}
      >
        <AvatarBlock
          avatarDataUrl={profile.avatarDataUrl}
          pixelEmoji={pixelEmoji}
          editable={false}
        />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Name + rank */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl tracking-widest font-bold" style={{ color: "var(--t-accent)" }}>
              {profile.displayUsername ?? profile.username ?? profile.name}
            </span>
            <span
              className="text-xs px-1 border tracking-widest"
              style={{
                borderColor: "var(--t-accent)",
                color: "var(--t-accent)",
                fontFamily: "var(--t-font-display)",
              }}
            >
              {rank.icon}
            </span>
            {isOwn && (
              <span
                className="text-xs px-1 border tracking-widest"
                style={{ borderColor: "var(--t-defrag-system, #008000)", color: "var(--t-defrag-system, #008000)" }}
              >
                C&apos;est vous
              </span>
            )}
          </div>

          {/* Username */}
          {profile.username && (
            <div className="text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>
              @{profile.username}
            </div>
          )}

          {/* Status */}
          {profile.statusMessage && (
            <div
              className="text-sm tracking-wider mt-1 flex items-center gap-1"
              style={{ color: "var(--t-text)" }}
            >
              <span className="animate-[blink_1.5s_step-end_infinite]">●</span>
              <em>{profile.statusMessage}</em>
            </div>
          )}

          {/* Rank full */}
          <div className="text-xs mt-auto" style={{ color: "var(--t-text-subtle, var(--t-text-muted))" }}>
            {rank.rank}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div
          className="p-3 border-[2px] text-sm tracking-wide leading-relaxed"
          style={{
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            backgroundColor: "var(--t-app-bg)",
            color: "var(--t-app-text)",
            fontFamily: "var(--t-font-display)",
            whiteSpace: "pre-wrap",
          }}
        >
          <div className="text-xs tracking-widest mb-2 font-bold" style={{ color: "var(--t-text-muted)" }}>
            📄 À PROPOS (UNTITLED.TXT)
          </div>
          {profile.bio}
        </div>
      )}

      {/* Stats */}
      <StatsBlock profile={profile} />

      {/* Disk visual */}
      <DiskUsageBar days={days} />
    </div>
  );
}

// ── Disk usage — fun filler ──────────────────────────────────────────────────

function DiskUsageBar({ days }: { days: number }) {
  const pct = Math.min(97, 60 + days * 0.1);
  return (
    <div
      className="p-2 border-[2px] text-sm"
      style={{
        borderTopColor: "var(--t-border-dark)",
        borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)",
        borderRightColor: "var(--t-border-light)",
        fontFamily: "var(--t-font-display)",
      }}
    >
      <div className="text-xs tracking-widest mb-1 flex justify-between" style={{ color: "var(--t-text-muted)" }}>
        <span>💾 C:\USERS\PROFIL — Espace utilisé</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div
        style={{
          height: 14,
          border: "2px solid",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
          backgroundColor: "var(--t-app-bg)",
          padding: 2,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct > 90
              ? "repeating-linear-gradient(90deg, var(--t-defrag-fragmented,#cc2200) 0, var(--t-defrag-fragmented,#cc2200) 8px, #ff4444 8px, #ff4444 10px)"
              : "repeating-linear-gradient(90deg, var(--t-accent) 0, var(--t-accent) 8px, var(--t-titlebar-to,#1084d0) 8px, var(--t-titlebar-to,#1084d0) 10px)",
            transition: "width 1s ease",
          }}
        />
      </div>
      {pct > 90 && (
        <div className="text-xs mt-1 animate-[blink_0.8s_step-end_infinite]" style={{ color: "var(--t-defrag-fragmented,#cc2200)" }}>
          ⚠ Espace disque critique ! Supprimez votre bio.
        </div>
      )}
    </div>
  );
}

// ── Edit Tab ──────────────────────────────────────────────────────────────────

function EditTab({
  profile, pixelEmoji,
  editName, setEditName,
  editBio, setEditBio,
  editStatus, setEditStatus,
  editFavoriteApp, setEditFavoriteApp,
  saving, uploading,
  onSave, onAvatarUpload, onAvatarDelete,
}: {
  profile: ProfileData;
  pixelEmoji: string;
  editName: string; setEditName: (v: string) => void;
  editBio: string; setEditBio: (v: string) => void;
  editStatus: string; setEditStatus: (v: string) => void;
  editFavoriteApp: string; setEditFavoriteApp: (v: string) => void;
  saving: boolean; uploading: boolean;
  onSave: () => void;
  onAvatarUpload: (f: File) => void;
  onAvatarDelete: () => void;
}) {
  const [statusSuggestion] = useState(() => pickRandom(STATUS_SUGGESTIONS));
  const [bioSuggestion] = useState(() => pickRandom(BIO_SUGGESTIONS));

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Avatar section */}
      <FieldSection label="📷 PHOTO DE PROFIL">
        <div className="flex gap-4 items-start">
          <AvatarBlock
            avatarDataUrl={profile.avatarDataUrl}
            pixelEmoji={pixelEmoji}
            editable
            onUpload={onAvatarUpload}
            onDelete={onAvatarDelete}
            uploading={uploading}
          />
          <div className="flex flex-col gap-1 text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
            <div>Format : JPG, PNG, GIF</div>
            <div>Taille max : 400 Ko</div>
            <div>Résolution : 200×200px (réduite automatiquement)</div>
            <div>Compatibilité : GunthOS 1.0+</div>
            <div className="mt-1" style={{ color: "var(--t-accent)" }}>
              ℹ️ L&apos;emoji {pixelEmoji} est utilisé si vous n&apos;avez pas de photo.
            </div>
            <div className="mt-1">
              <em>Astuce : soufflez sur votre photo avant de l&apos;uploader.</em>
            </div>
          </div>
        </div>
      </FieldSection>

      {/* Name */}
      <FieldSection label="👤 NOM AFFICHÉ">
        <RetroInput
          value={editName}
          onChange={setEditName}
          placeholder="Votre nom"
          maxLength={60}
        />
        <div className="text-xs mt-1" style={{ color: "var(--t-text-muted)" }}>
          {editName.length}/60 caractères — Évitez «&nbsp;Admin&nbsp;», c&apos;est pris.
        </div>
      </FieldSection>

      {/* Status */}
      <FieldSection label="● STATUT (visible par tous)">
        <RetroInput
          value={editStatus}
          onChange={setEditStatus}
          placeholder={statusSuggestion}
          maxLength={80}
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {STATUS_SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => setEditStatus(s)}
              style={{
                fontFamily: "var(--t-font-display)",
                fontSize: "0.7rem",
                padding: "1px 6px",
                border: "1px solid var(--t-border-dark)",
                backgroundColor: "var(--t-bg-dark)",
                color: "var(--t-text-muted)",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </FieldSection>

      {/* Bio */}
      <FieldSection label="📄 BIO (max 280 caractères)">
        <RetroInput
          value={editBio}
          onChange={setEditBio}
          placeholder={bioSuggestion}
          maxLength={280}
          multiline
          rows={4}
        />
        <div className="text-xs mt-1" style={{ color: editBio.length > 250 ? "var(--t-defrag-fragmented,#cc2200)" : "var(--t-text-muted)" }}>
          {editBio.length}/280 — {editBio.length > 250 ? "⚠ Secteur disque presque plein !" : "Espace disque suffisant."}
        </div>
      </FieldSection>

      {/* App favorite */}
      <FieldSection label="⭐ APPLICATION FAVORITE">
        <div className="flex flex-wrap gap-1">
          {FAVORITE_APPS.map((app) => (
            <button
              key={app.value}
              onClick={() => setEditFavoriteApp(editFavoriteApp === app.value ? "" : app.value)}
              style={{
                fontFamily: "var(--t-font-display)",
                fontSize: "0.8rem",
                padding: "3px 10px",
                border: "2px solid",
                borderTopColor: editFavoriteApp === app.value ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderLeftColor: editFavoriteApp === app.value ? "var(--t-border-dark)" : "var(--t-border-light)",
                borderBottomColor: editFavoriteApp === app.value ? "var(--t-border-light)" : "var(--t-border-dark)",
                borderRightColor: editFavoriteApp === app.value ? "var(--t-border-light)" : "var(--t-border-dark)",
                backgroundColor: editFavoriteApp === app.value ? "var(--t-accent)" : "var(--t-bg)",
                color: editFavoriteApp === app.value ? "var(--t-titlebar-text)" : "var(--t-text)",
                cursor: "pointer",
              }}
              title={app.desc}
            >
              {app.label}
            </button>
          ))}
        </div>
        {editFavoriteApp && (
          <div className="text-xs mt-1 italic" style={{ color: "var(--t-text-muted)" }}>
            {FAVORITE_APPS.find((a) => a.value === editFavoriteApp)?.desc}
          </div>
        )}
      </FieldSection>

      {/* Save */}
      <div className="flex gap-2 pt-2">
        <RetroBtn onClick={onSave} disabled={saving} variant="primary">
          {saving ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
        </RetroBtn>
        <div className="text-xs self-center" style={{ color: "var(--t-text-muted)" }}>
          {saving ? "Écriture sur le disque dur..." : "Cliquez pour enregistrer vos modifications."}
        </div>
      </div>
    </div>
  );
}

function FieldSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="text-xs tracking-widest font-bold"
        style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// ── PublicProfileApp (voir le profil d'un autre user) ─────────────────────────

export function PublicProfileApp({ username }: { username: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelEmoji] = useState(() => pickRandom(PIXEL_AVATARS));
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
        <div className="text-xs mt-1">Connexion 56K en cours...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 flex flex-col items-center gap-3" style={{ fontFamily: "var(--t-font-display)" }}>
        <div className="text-5xl">🚫</div>
        <div className="text-xl tracking-widest" style={{ color: "var(--t-accent)" }}>PROFIL INTROUVABLE</div>
        <div className="text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>
          {error ?? "Secteur disque corrompu."}
        </div>
        <div className="text-xs" style={{ color: "var(--t-text-subtle, var(--t-text-muted))" }}>
          @{username} n&apos;existe pas ou a été défragmenté.
        </div>
      </div>
    );
  }

  const isOwnProfile = me?.username === profile.username;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="flex-1 overflow-auto">
        <ViewTab profile={profile} pixelEmoji={pixelEmoji} isOwn={isOwnProfile} />
      </div>
      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between"
        style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text-muted)", backgroundColor: "var(--t-bg)" }}
      >
        <span>Profil public de @{profile.username}</span>
        <span>GunthProfil™ v1.0</span>
      </div>
    </div>
  );
}

// ── UserDirectory — liste de tous les profils ─────────────────────────────────

interface PublicUser {
  username: string | null;
  displayUsername: string | null;
  name: string;
  statusMessage: string | null;
  avatarDataUrl: string | null;
  createdAt: Date | string | null;
}

export function UserDirectoryApp() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { openWindow } = useWindowManager();

  useEffect(() => {
    fetch("/api/profiles/list")
      .then((r) => r.json())
      .then((data: { users?: PublicUser[] }) => {
        if (data.users) setUsers(data.users);
      })
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
    return (
      (u.username ?? "").toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q)
    );
  });

  function openProfile(username: string) {
    openWindow(`profile:${username}`, `Profil @${username}`, "👤");
  }

  if (loading) {
    return (
      <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <div className="text-4xl animate-[blink_1s_step-end_infinite]">⏳</div>
        <div className="mt-2 tracking-widest">Téléchargement de l&apos;annuaire...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      {/* Search bar */}
      <div
        className="p-2 border-b shrink-0 flex gap-2 items-center"
        style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}
      >
        <span style={{ color: "var(--t-text-muted)" }}>🔍</span>
        <RetroInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un utilisateur..."
        />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--t-text-muted)" }}>
            {search ? "Aucun utilisateur trouvé. Vérifiez l'orthographe." : "Aucun utilisateur inscrit. Soyez le premier !"}
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
                  style={{
                    borderColor: "var(--t-border-dark)",
                    fontFamily: "var(--t-font-display)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.background = "var(--t-card-hover)"; }}
                  onBlur={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Mini avatar */}
                  <div
                    style={{
                      width: 40, height: 40, flexShrink: 0,
                      border: "2px solid",
                      borderTopColor: "var(--t-border-dark)",
                      borderLeftColor: "var(--t-border-dark)",
                      borderBottomColor: "var(--t-border-light)",
                      borderRightColor: "var(--t-border-light)",
                      backgroundColor: "var(--t-app-bg)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {u.avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider" style={{ color: "var(--t-text)" }}>
                        {u.displayUsername ?? u.username ?? u.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--t-text-muted)" }}>{rank.icon}</span>
                    </div>
                    {u.statusMessage && (
                      <div className="text-xs truncate" style={{ color: "var(--t-text-muted)" }}>
                        <span className="animate-[blink_2s_step-end_infinite]">●</span> {u.statusMessage}
                      </div>
                    )}
                  </div>

                  <div className="text-xs shrink-0" style={{ color: "var(--t-text-subtle, var(--t-text-muted))" }}>
                    {days}j
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between"
        style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text-muted)", backgroundColor: "var(--t-bg)" }}
      >
        <span>{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</span>
        <span>Double-clic pour voir le profil</span>
      </div>
    </div>
  );
}
