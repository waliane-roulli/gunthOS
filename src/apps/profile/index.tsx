"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { authClient } from "@/lib/auth-client";
import { pickRandom, PROFILE_SAVE_MESSAGES } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";
import {
  type ProfileData, FAVORITE_APPS, STATUS_SUGGESTIONS, BIO_SUGGESTIONS,
  PIXEL_AVATARS, getDaysSinceJoin, getGunthosRank, resizeImageToDataUrl,
  RetroBtn, RetroInput, AvatarBlock, ViewTab, FieldSection,
} from "./_shared";

export function ProfileApp(_: AppProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"view" | "edit">("view");

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

  useEffect(() => { if (user) loadProfile(); }, [user, loadProfile]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, bio: editBio, statusMessage: editStatus, favoriteApp: editFavoriteApp }),
      });
      setSaveMsg(pickRandom(PROFILE_SAVE_MESSAGES));
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
      const res = await fetch("/api/user/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl }) });
      const json = await res.json() as { error?: string };
      setSaveMsg(res.ok ? "📷 Photo de profil mise à jour !" : `❌ ${json.error ?? "Erreur upload"}`);
      if (res.ok) await loadProfile();
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
    return <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}><div className="text-4xl mb-3">🔒</div><div className="tracking-widest">Vous devez être connecté pour voir votre profil.</div></div>;
  }
  if (loading) {
    return <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}><div className="text-4xl mb-3 animate-[blink_1s_step-end_infinite]">⏳</div><div className="tracking-widest">Chargement du profil depuis le disque dur...</div></div>;
  }
  if (!profile) {
    return <div className="p-6 text-center" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-defrag-fragmented, #cc2200)" }}><div className="text-4xl mb-3">💥</div><div className="tracking-widest">Profil introuvable. Secteur disque corrompu.</div></div>;
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="flex border-b shrink-0" style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg-dark)" }}>
        {(["view", "edit"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 text-sm tracking-widest border-r"
            style={{ fontFamily: "var(--t-font-display)", borderColor: "var(--t-border-dark)", background: tab === t ? "var(--t-bg)" : "transparent", color: tab === t ? "var(--t-text)" : "var(--t-text-muted)", borderBottom: tab === t ? "2px solid var(--t-bg)" : "none", marginBottom: tab === t ? -1 : 0, cursor: "pointer" }}
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
            profile={profile} pixelEmoji={pixelEmoji}
            editName={editName} setEditName={setEditName}
            editBio={editBio} setEditBio={setEditBio}
            editStatus={editStatus} setEditStatus={setEditStatus}
            editFavoriteApp={editFavoriteApp} setEditFavoriteApp={setEditFavoriteApp}
            saving={saving} uploading={uploading}
            onSave={handleSave} onAvatarUpload={handleAvatarUpload} onAvatarDelete={handleAvatarDelete}
          />
        )}
      </div>

      <div className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between" style={{ borderColor: "var(--t-border-dark)", color: saveMsg ? "var(--t-accent)" : "var(--t-text-muted)", backgroundColor: "var(--t-bg)" }}>
        <span>{saveMsg ?? `Profil de ${profile.displayUsername ?? profile.username ?? profile.name}`}</span>
        <span>GunthProfil™ v1.0</span>
      </div>
    </div>
  );
}

function EditTab({
  profile, pixelEmoji,
  editName, setEditName, editBio, setEditBio, editStatus, setEditStatus, editFavoriteApp, setEditFavoriteApp,
  saving, uploading, onSave, onAvatarUpload, onAvatarDelete,
}: {
  profile: ProfileData; pixelEmoji: string;
  editName: string; setEditName: (v: string) => void;
  editBio: string; setEditBio: (v: string) => void;
  editStatus: string; setEditStatus: (v: string) => void;
  editFavoriteApp: string; setEditFavoriteApp: (v: string) => void;
  saving: boolean; uploading: boolean;
  onSave: () => void; onAvatarUpload: (f: File) => void; onAvatarDelete: () => void;
}) {
  const [statusSuggestion] = useState(() => pickRandom(STATUS_SUGGESTIONS));
  const [bioSuggestion] = useState(() => pickRandom(BIO_SUGGESTIONS));

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: "❌ Les mots de passe ne correspondent pas.", ok: false });
      setTimeout(() => setPwdMsg(null), 4000);
      return;
    }
    if (newPassword.length < 1) {
      setPwdMsg({ text: "❌ Le mot de passe ne peut pas être vide.", ok: false });
      setTimeout(() => setPwdMsg(null), 4000);
      return;
    }
    setPwdSaving(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false });
      if (result.error) {
        setPwdMsg({ text: `❌ ${result.error.message ?? "Erreur inconnue"}`, ok: false });
      } else {
        setPwdMsg({ text: "✅ Mot de passe mis à jour avec succès.", ok: true });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setPwdSaving(false);
      setTimeout(() => setPwdMsg(null), 5000);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <FieldSection label="📷 PHOTO DE PROFIL">
        <div className="flex gap-4 items-start">
          <AvatarBlock avatarDataUrl={profile.avatarDataUrl} pixelEmoji={pixelEmoji} editable onUpload={onAvatarUpload} onDelete={onAvatarDelete} uploading={uploading} />
          <div className="flex flex-col gap-1 text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
            <div>Format : JPG, PNG, GIF</div>
            <div>Taille max : 400 Ko</div>
            <div>Résolution : 200×200px (réduite automatiquement)</div>
            <div>Compatibilité : GunthOS 1.0+</div>
            <div className="mt-1" style={{ color: "var(--t-accent)" }}>ℹ️ L&apos;emoji {pixelEmoji} est utilisé si vous n&apos;avez pas de photo.</div>
            <div className="mt-1"><em>Astuce : soufflez sur votre photo avant de l&apos;uploader.</em></div>
          </div>
        </div>
      </FieldSection>

      <FieldSection label="👤 NOM AFFICHÉ">
        <RetroInput value={editName} onChange={setEditName} placeholder="Votre nom" maxLength={60} />
        <div className="text-xs mt-1" style={{ color: "var(--t-text-muted)" }}>{editName.length}/60 caractères — Évitez «&nbsp;Admin&nbsp;», c&apos;est pris.</div>
      </FieldSection>

      <FieldSection label="● STATUT (visible par tous)">
        <RetroInput value={editStatus} onChange={setEditStatus} placeholder={statusSuggestion} maxLength={80} />
        <div className="flex flex-wrap gap-1 mt-1">
          {STATUS_SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => setEditStatus(s)}
              style={{ fontFamily: "var(--t-font-display)", fontSize: "0.7rem", padding: "1px 6px", border: "1px solid var(--t-border-dark)", backgroundColor: "var(--t-bg-dark)", color: "var(--t-text-muted)", cursor: "pointer" }}
            >{s}</button>
          ))}
        </div>
      </FieldSection>

      <FieldSection label="📄 BIO (max 280 caractères)">
        <RetroInput value={editBio} onChange={setEditBio} placeholder={bioSuggestion} maxLength={280} multiline rows={4} />
        <div className="text-xs mt-1" style={{ color: editBio.length > 250 ? "var(--t-defrag-fragmented,#cc2200)" : "var(--t-text-muted)" }}>
          {editBio.length}/280 — {editBio.length > 250 ? "⚠ Secteur disque presque plein !" : "Espace disque suffisant."}
        </div>
      </FieldSection>

      <FieldSection label="⭐ APPLICATION FAVORITE">
        <div className="flex flex-wrap gap-1">
          {FAVORITE_APPS.map((app) => (
            <button key={app.value} onClick={() => setEditFavoriteApp(editFavoriteApp === app.value ? "" : app.value)} title={app.desc}
              style={{ fontFamily: "var(--t-font-display)", fontSize: "0.8rem", padding: "3px 10px", border: "2px solid", borderTopColor: editFavoriteApp === app.value ? "var(--t-border-dark)" : "var(--t-border-light)", borderLeftColor: editFavoriteApp === app.value ? "var(--t-border-dark)" : "var(--t-border-light)", borderBottomColor: editFavoriteApp === app.value ? "var(--t-border-light)" : "var(--t-border-dark)", borderRightColor: editFavoriteApp === app.value ? "var(--t-border-light)" : "var(--t-border-dark)", backgroundColor: editFavoriteApp === app.value ? "var(--t-accent)" : "var(--t-bg)", color: editFavoriteApp === app.value ? "var(--t-titlebar-text)" : "var(--t-text)", cursor: "pointer" }}
            >{app.label}</button>
          ))}
        </div>
        {editFavoriteApp && <div className="text-xs mt-1 italic" style={{ color: "var(--t-text-muted)" }}>{FAVORITE_APPS.find((a) => a.value === editFavoriteApp)?.desc}</div>}
      </FieldSection>

      <div className="flex gap-2 pt-2">
        <RetroBtn onClick={onSave} disabled={saving} variant="primary">{saving ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}</RetroBtn>
        <div className="text-xs self-center" style={{ color: "var(--t-text-muted)" }}>{saving ? "Écriture sur le disque dur..." : "Cliquez pour enregistrer vos modifications."}</div>
      </div>

      <div className="border-t pt-4" style={{ borderColor: "var(--t-border-dark)" }}>
        <FieldSection label="🔑 CHANGER LE MOT DE PASSE">
          <div className="flex flex-col gap-2">
            <RetroInput value={currentPassword} onChange={setCurrentPassword} placeholder="Mot de passe actuel" type="password" />
            <RetroInput value={newPassword} onChange={setNewPassword} placeholder="Nouveau mot de passe" type="password" />
            <RetroInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirmer le nouveau mot de passe" type="password" />
            <div className="flex gap-2 items-center">
              <RetroBtn onClick={handlePasswordChange} disabled={pwdSaving || !currentPassword || !newPassword || !confirmPassword}>
                {pwdSaving ? "⏳ Mise à jour..." : "🔒 Changer le mot de passe"}
              </RetroBtn>
              {pwdMsg && (
                <div className="text-xs" style={{ color: pwdMsg.ok ? "var(--t-accent)" : "var(--t-defrag-fragmented,#cc2200)", fontFamily: "var(--t-font-display)" }}>
                  {pwdMsg.text}
                </div>
              )}
            </div>
          </div>
        </FieldSection>
      </div>
    </div>
  );
}
