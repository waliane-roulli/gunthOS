"use client";

import { useState, useEffect } from "react";
import type { Experience } from "../types";
import { raisedStyle, sunkenStyle } from "../helpers";
import { ABSURD_TITLES, ABSURD_COMPANIES, RELATIONSHIP_SUGGESTIONS } from "../constants";
import { DialogShell } from "./Toast";

// ── ProfilEditDialog ───────────────────────────────────────────────────────────

export function ProfilEditDialog({ initialHeadline, initialLocation, onClose, onSaved, playClick, playPop }: {
  initialHeadline: string | null;
  initialLocation: string | null;
  onClose: () => void;
  onSaved: (headline: string, location: string) => void;
  playClick: () => void;
  playPop: () => void;
}) {
  const [headline, setHeadline] = useState(initialHeadline ?? "");
  const [location, setLocation] = useState(initialLocation ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/linked-gunth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: headline.trim() || null, location: location.trim() || null }),
      });
      if (res.ok) {
        playPop();
        setSaved(true);
        onSaved(headline.trim(), location.trim());
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogShell title="✏️ Modifier le profil" onClose={() => { playClick(); onClose(); }} width="400px">
      {saved ? (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm mb-1" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>Profil mis à jour !</div>
          <div className="text-xs mb-3" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Vos modifications seront visibles par vos 3 relations.</div>
          <button onClick={() => { playClick(); onClose(); }} className="px-3 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>Fermer</button>
        </div>
      ) : (
        <>
          <div className="mb-2">
            <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Titre / Headline</div>
            <div className="border-2" style={{ ...sunkenStyle() }}>
              <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Chief Disruption Officer | En recherche d'authenticité" maxLength={120} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
            </div>
          </div>
          <div className="mb-2">
            <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Localisation</div>
            <div className="border-2" style={{ ...sunkenStyle() }}>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Paris, Île-de-France" maxLength={80} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
            </div>
          </div>
          <div className="text-xs mt-1 mb-2" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>* Les champs vides seront remplis par l&apos;IA Premium (29,99€/mois)</div>
          <div className="flex gap-1.5 justify-end">
            <button onClick={() => { playClick(); onClose(); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} className="px-2 py-1 text-sm border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
              {saving ? "Enregistrement…" : "💾 Enregistrer"}
            </button>
          </div>
        </>
      )}
    </DialogShell>
  );
}

// ── AddExperienceDialog ────────────────────────────────────────────────────────

export function AddExperienceDialog({ onClose, onSubmit, playClick, playPop }: {
  onClose: () => void;
  onSubmit: (data: Omit<Experience, "id" | "userId">) => Promise<void>;
  playClick: () => void;
  playPop: () => void;
}) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endYear, setEndYear] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !company.trim() || !startYear) return;
    setSaving(true);
    await onSubmit({
      title: title.trim(),
      company: company.trim(),
      startYear: parseInt(startYear),
      endYear: isCurrent ? null : (endYear ? parseInt(endYear) : null),
      isCurrent,
      description: description.trim() || null,
      createdAt: new Date().toISOString(),
    } as Omit<Experience, "id" | "userId">);
    setSaving(false);
  }

  return (
    <DialogShell title="💼 Ajouter une expérience" onClose={onClose} width="420px">
      <div className="mb-2">
        <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Titre du poste *</div>
        <div className="border-2" style={{ ...sunkenStyle() }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ABSURD_TITLES[Math.floor(Math.random() * ABSURD_TITLES.length)]} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
        </div>
      </div>
      <div className="mb-2">
        <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Entreprise *</div>
        <div className="border-2" style={{ ...sunkenStyle() }}>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={ABSURD_COMPANIES[Math.floor(Math.random() * ABSURD_COMPANIES.length)]} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Début *</div>
          <div className="border-2" style={{ ...sunkenStyle() }}>
            <input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} min="1970" max="2030" className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Fin</div>
          <div className="border-2" style={{ ...sunkenStyle(), opacity: isCurrent ? 0.4 : 1 }}>
            <input type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} disabled={isCurrent} placeholder="2024" min="1970" max="2030" className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <input type="checkbox" id="isCurrent" checked={isCurrent} onChange={(e) => { playClick(); setIsCurrent(e.target.checked); }} />
        <label htmlFor="isCurrent" className="text-xs cursor-pointer" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Poste actuel (je mens peut-être)</label>
      </div>
      <div className="mb-3">
        <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Description <span style={{ color: "var(--t-text-subtle)" }}>(optionnel)</span></div>
        <div className="border-2" style={{ ...sunkenStyle() }}>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="J'ai transformé l'entreprise en profondeur grâce à mes synergies disruptives." className="w-full border-none outline-none px-2 py-1 text-sm resize-none" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
        </div>
      </div>
      <div className="flex gap-1.5 justify-end">
        <button onClick={onClose} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Annuler</button>
        <button onClick={() => { playPop(); handleSubmit(); }} disabled={saving || !title.trim() || !company.trim()} className="px-2 py-1 text-sm border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
          {saving ? "Enregistrement…" : "💾 Ajouter"}
        </button>
      </div>
    </DialogShell>
  );
}

// ── AddRecommendationDialog ────────────────────────────────────────────────────

export function AddRecommendationDialog({ currentUserId, onClose, onSubmit, playClick, playPop }: {
  currentUserId: string;
  onClose: () => void;
  onSubmit: (toUserId: string, content: string, relationship: string) => Promise<void>;
  playClick: () => void;
  playPop: () => void;
}) {
  const [users, setUsers] = useState<{ id: string; name: string; username: string | null }[]>([]);
  const [toUserId, setToUserId] = useState("");
  const [content, setContent] = useState("");
  const [relationship, setRelationship] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/list")
      .then((r) => r.ok ? r.json() : { users: [] })
      .then((d: { users?: { id: string; name: string; username: string | null }[] }) => {
        setUsers((d.users ?? []).filter((u) => u.id !== currentUserId));
      })
      .catch(() => {});
  }, [currentUserId]);

  async function handleSubmit() {
    if (!toUserId || !content.trim() || !relationship.trim()) return;
    setSaving(true);
    await onSubmit(toUserId, content.trim(), relationship.trim());
    setSaving(false);
  }

  return (
    <DialogShell title="🏆 Rédiger une recommandation" onClose={onClose} width="440px">
      <div className="mb-2">
        <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Pour qui ? *</div>
        <div className="border-2" style={{ ...sunkenStyle() }}>
          <select value={toUserId} onChange={(e) => { playClick(); setToUserId(e.target.value); }} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}>
            <option value="">— Choisir un utilisateur —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}{u.username ? ` (@${u.username})` : ""}</option>
            ))}
          </select>
        </div>
        {users.length === 0 && (
          <div className="text-[0.65rem] mt-0.5" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>Aucun autre utilisateur inscrit. Vous êtes seul(e). C&apos;est LinkedGunth.</div>
        )}
      </div>
      <div className="mb-2">
        <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Votre relation *</div>
        <div className="border-2" style={{ ...sunkenStyle() }}>
          <input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder={RELATIONSHIP_SUGGESTIONS[Math.floor(Math.random() * RELATIONSHIP_SUGGESTIONS.length)]} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Recommandation * <span style={{ color: "var(--t-text-subtle)" }}>(max 600 car.)</span></div>
          <span className="text-[0.65rem]" style={{ color: content.length > 500 ? "var(--t-accent)" : "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{content.length}/600</span>
        </div>
        <div className="border-2" style={{ ...sunkenStyle() }}>
          <textarea value={content} onChange={(e) => setContent(e.target.value.slice(0, 600))} rows={4} placeholder="J'ai eu le privilège de travailler avec cette personne exceptionnelle..." className="w-full border-none outline-none px-2 py-1 text-sm resize-none" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
        </div>
      </div>
      <div className="flex gap-1.5 justify-end">
        <button onClick={onClose} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Annuler</button>
        <button onClick={() => { playPop(); handleSubmit(); }} disabled={saving || !toUserId || !content.trim() || !relationship.trim()} className="px-2 py-1 text-sm border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
          {saving ? "Envoi…" : "🏆 Recommander"}
        </button>
      </div>
    </DialogShell>
  );
}

// ── InlineEditField ────────────────────────────────────────────────────────────

export function InlineEditField({ value, placeholder, maxLength, disabled, onSave, style }: {
  value: string;
  placeholder: string;
  maxLength: number;
  disabled: boolean;
  onSave: (val: string) => Promise<void>;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 my-0.5">
        <div className="flex-1 border-2" style={{ ...sunkenStyle() }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            maxLength={maxLength}
            className="w-full border-none outline-none px-1.5 py-0.5"
            style={{ ...style, backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}
          />
        </div>
        {saving && <span className="text-xs animate-[blink_0.5s_step-end_infinite]" style={{ color: "var(--t-text-muted)" }}>💾</span>}
      </div>
    );
  }

  const display = value || placeholder;
  return (
    <div
      className={`my-0.5 truncate ${!disabled ? "cursor-pointer hover:underline hover:opacity-80" : ""}`}
      style={{ ...style, opacity: value ? 1 : 0.5 }}
      onClick={() => { if (!disabled) setEditing(true); }}
      title={!disabled ? "Cliquer pour modifier" : undefined}
    >
      {display}
      {!disabled && <span className="ml-1 text-[0.6rem] opacity-40">✏️</span>}
    </div>
  );
}
