"use client";

import { useState, useEffect } from "react";
import type { Experience, Recommendation, ProfileData, ProfileView, NetworkUser, ViewedProfile } from "../types";
import { raisedStyle, sunkenStyle, timeAgo } from "../helpers";
import { SKILLS, TITLEBAR_GRADIENT } from "../constants";
import { Avatar } from "../components/Avatar";
import { InlineEditField } from "../components/Dialogs";

function StatCounter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 28;
    const interval = setInterval(() => {
      frame++;
      setDisplayed(Math.floor((value * frame) / steps));
      if (frame >= steps) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="text-center px-3 py-2 border-2" style={{ borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}>
      <div className="text-lg font-bold" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>{displayed.toLocaleString("fr-FR")}{suffix}</div>
      <div className="text-[0.65rem]" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{label}</div>
    </div>
  );
}

interface ProfilTabProps {
  user: { id: string; name?: string | null } | null;
  avatarDataUrl: string | null;
  profileData: ProfileData | null;
  experiences: Experience[];
  recommendations: Recommendation[];
  profileViews: ProfileView[];
  profileViewCount: number;
  followersCount: number;
  endorsementCounts: Record<string, number>;
  myEndorsements: string[];
  endorsedSkills: Record<number, number>;
  openToWork: boolean;
  network: { following: NetworkUser[]; followers: NetworkUser[]; suggestions: NetworkUser[]; followingIds: string[]; followerIds: string[] } | null;
  followedUsers: Set<string>;
  onToggleOpenToWork: () => void;
  onDeleteExperience: (id: number) => void;
  onEndorseSkill: (idx: number) => void;
  onEndorseUserSkill: (toUserId: string, skillName: string) => void;
  onDeleteRecommendation: (id: number) => void;
  onFollowUser: (id: string, name: string) => void;
  onShowProfilEdit: () => void;
  onShowAddExperience: () => void;
  onShowAddRecommendation: () => void;
  onShowPremium: () => void;
  onOpenProfile: (p: ViewedProfile) => void;
  onSaveField: (field: "headline" | "location", value: string) => Promise<void>;
  playClick: () => void;
  playBip: () => void;
}

export function ProfilTab({
  user, avatarDataUrl, profileData, experiences, recommendations, profileViews, profileViewCount,
  followersCount, endorsementCounts, myEndorsements, endorsedSkills, openToWork, network, followedUsers,
  onToggleOpenToWork, onDeleteExperience, onEndorseSkill, onEndorseUserSkill, onDeleteRecommendation,
  onFollowUser, onShowProfilEdit, onShowAddExperience, onShowAddRecommendation, onShowPremium,
  onOpenProfile, onSaveField, playClick, playBip,
}: ProfilTabProps) {
  const [showViewers, setShowViewers] = useState(false);

  return (
    <div className="overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
      {/* Bannière */}
      <div className="h-14 relative" style={{ background: "linear-gradient(135deg, var(--t-titlebar-from), var(--t-titlebar-to))" }}>
        {openToWork && (
          <div className="absolute bottom-1 left-2 text-[0.6rem] px-1.5 py-0.5 animate-[blink_2s_step-end_infinite]" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)" }}>
            🟢 OPEN TO WORK
          </div>
        )}
      </div>

      {/* Infos principales */}
      <div className="px-3 pb-3 -mt-5">
        <Avatar src={avatarDataUrl} emoji="👤" size={52} />
        <div className="mt-2 flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{user?.name ?? "Visiteur"}</div>
            <InlineEditField
              value={profileData?.headline ?? ""}
              placeholder="En recherche de nouvelles opportunités | Ouvert au monde 🌍"
              maxLength={120}
              disabled={!user}
              onSave={(val) => onSaveField("headline", val)}
              style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-sm)" }}
            />
            <InlineEditField
              value={profileData?.location ?? ""}
              placeholder="Paris, Île-de-France"
              maxLength={80}
              disabled={!user}
              onSave={(val) => onSaveField("location", val)}
              style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-xs)" }}
            />
            <div className="text-xs mt-0.5" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>
              {followersCount} relations ·{" "}
              <span className="cursor-pointer underline" onClick={() => { playBip(); onShowPremium(); }}>🔒 500+ avec Premium</span>
            </div>
          </div>
          {user && (
            <button
              onClick={onToggleOpenToWork}
              className={`shrink-0 px-1.5 py-0.5 text-xs border-2 ${openToWork ? "animate-[blink_2s_step-end_infinite]" : "opacity-60"}`}
              style={{ borderColor: openToWork ? "var(--t-accent)" : "var(--t-border-dark)", backgroundColor: openToWork ? "var(--t-accent)" : "var(--t-bg)", color: openToWork ? "var(--t-titlebar-text)" : "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
            >
              {openToWork ? "🟢 OTW" : "⚪ OTW"}
            </button>
          )}
        </div>

        <div className="flex gap-1 mt-2">
          <button onClick={() => { playClick(); onShowProfilEdit(); }} className="flex-1 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>✏️ Modifier</button>
          <button onClick={() => { playClick(); onShowAddExperience(); }} className="flex-1 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>💼 + Expérience</button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <div className="px-2 py-1 text-sm mb-2" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
          📊 Statistiques du profil
        </div>
        <div className="grid grid-cols-3 gap-1 mb-1">
          <StatCounter label="Vues du profil" value={profileViewCount || 7} />
          <StatCounter label="Apparitions" value={142} />
          <StatCounter label="Recherches" value={0} />
        </div>
        <button
          onClick={() => { playBip(); setShowViewers((v) => !v); }}
          className="w-full text-left mt-1 px-2 py-1 text-xs border-2"
          style={{ ...sunkenStyle(), fontFamily: "var(--t-font-display)" }}
        >
          👁 {profileViewCount > 0 ? `${profileViewCount} personne(s) ont consulté votre profil` : "Personne n'a encore consulté votre profil"}
          {profileViewCount > 0 && <span className="float-right opacity-60">{showViewers ? "▲" : "▼"}</span>}
        </button>
        {showViewers && profileViews.length > 0 && (
          <div className="mt-1 border-2" style={{ ...sunkenStyle() }}>
            {profileViews.slice(0, 8).map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-1.5 px-2 py-1 border-b last:border-0"
                style={{ borderColor: "var(--t-border-dark)", cursor: v.botName ? "pointer" : "default" }}
                onClick={() => {
                  if (!v.botName) return;
                  playClick();
                  onOpenProfile({ kind: "bot", name: v.botName, title: v.botTitle ?? "", emoji: v.botEmoji ?? "👤" });
                }}
              >
                <span className="text-base">{v.botEmoji ?? "👤"}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: v.botName ? "var(--t-accent)" : "var(--t-app-text)", fontFamily: "var(--t-font-display)" }}>
                    {v.viewerUserId ? <span className="blur-[4px] select-none">🔒 Utilisateur Premium</span> : v.botName}
                  </div>
                  <div className="text-[0.6rem] truncate" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
                    {v.viewerUserId ? <span className="blur-[4px] select-none">Débloquer avec Premium</span> : v.botTitle}
                  </div>
                </div>
                <span className="text-[0.6rem] ml-auto shrink-0" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
                  {timeAgo(v.viewedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expériences */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="px-2 py-1 text-sm flex-1 mr-1" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
            💼 Expériences
          </div>
          {user && (
            <button onClick={() => { playClick(); onShowAddExperience(); }} className="px-1.5 py-0.5 text-xs border-2 shrink-0" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>+ Ajouter</button>
          )}
        </div>
        {experiences.length === 0 ? (
          <div className="text-xs text-center py-2 border-2" style={{ ...sunkenStyle(), fontFamily: "var(--t-font-display)", color: "var(--t-text-subtle)" }}>
            Aucune expérience renseignée. Le vide, c&apos;est aussi une forme d&apos;authenticité.
          </div>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id} className="flex items-start gap-2 mb-1.5 p-1.5 border-2" style={{ ...sunkenStyle() }}>
              <div className="text-xl shrink-0 mt-0.5">🏢</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-display)" }}>{exp.title}</div>
                <div className="text-xs truncate" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{exp.company}</div>
                <div className="text-[0.65rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
                  {exp.startYear} — {exp.isCurrent ? "Présent" : (exp.endYear ?? "?")}
                </div>
                {exp.description && (
                  <div className="text-xs mt-0.5 leading-snug" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-body)" }}>{exp.description}</div>
                )}
              </div>
              {user && (
                <button onClick={() => onDeleteExperience(exp.id)} className="shrink-0 px-1 text-xs border-2 opacity-40 hover:opacity-100" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>✕</button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Compétences */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <div className="px-2 py-1 text-sm mb-2" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
          🧠 Compétences validées
        </div>
        {SKILLS.map((skill, i) => {
          const extra = endorsedSkills[i] ?? 0;
          const realCount = endorsementCounts[skill.name] ?? 0;
          const count = skill.base + extra + realCount;
          const iEndorsed = myEndorsements.includes(skill.name);
          return (
            <div key={skill.name} className="flex items-center gap-1.5 mb-1">
              <div className="flex-1 px-2 py-0.5 text-sm border-2" style={{ ...sunkenStyle() }}>
                {skill.name}
                <span className="text-xs ml-2" style={{ color: (extra > 0 || realCount > 0) ? "var(--t-accent)" : "var(--t-text-muted)", fontFamily: "var(--t-font-display)", fontWeight: (extra > 0 || realCount > 0) ? "bold" : undefined, transition: "color 0.3s" }}>
                  ×{count}{(extra > 0 || realCount > 0) && " ✨"}
                </span>
                {realCount > 0 && (
                  <span className="text-[0.6rem] ml-1" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>+{realCount} vrais</span>
                )}
              </div>
              <button
                onClick={() => {
                  if (user) {
                    onEndorseUserSkill(user.id, skill.name);
                  } else {
                    onEndorseSkill(i);
                  }
                }}
                className="px-1.5 py-0.5 text-xs border-2"
                style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(iEndorsed || extra > 0), transition: "background-color 0.2s" }}
              >
                👍{extra > 0 ? ` +${extra}` : iEndorsed ? " ✓" : ""}
              </button>
            </div>
          );
        })}
      </div>

      {/* Réseau */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <div className="px-2 py-1 text-sm mb-2" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
          🤝 Mon réseau
        </div>
        {!network ? (
          <div className="text-xs text-center py-2" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>Chargement…</div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs mb-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Abonnements ({network.following.length})</div>
            {network.following.length === 0 ? (
              <div className="text-xs py-1 text-center border-2 mb-1" style={{ ...sunkenStyle(), fontFamily: "var(--t-font-display)", color: "var(--t-text-subtle)" }}>
                Vous ne suivez personne. C&apos;est libérateur.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mb-1">
                {network.following.map((u) => (
                  <button key={u.id} onClick={() => { playClick(); onOpenProfile({ kind: "user", userId: u.id, name: u.name }); }} className="flex items-center gap-1 px-1.5 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-display)", ...raisedStyle() }}>
                    <Avatar src={u.avatarDataUrl} emoji="👤" size={18} />
                    <span style={{ color: "var(--t-text)" }}>{u.name}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="text-xs mb-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Abonnés ({network.followers.length})</div>
            {network.followers.length === 0 ? (
              <div className="text-xs py-1 text-center border-2 mb-1" style={{ ...sunkenStyle(), fontFamily: "var(--t-font-display)", color: "var(--t-text-subtle)" }}>
                Aucun abonné. Même votre mère ne vous suit pas.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mb-1">
                {network.followers.map((u) => (
                  <button key={u.id} onClick={() => { playClick(); onOpenProfile({ kind: "user", userId: u.id, name: u.name }); }} className="flex items-center gap-1 px-1.5 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-display)", ...raisedStyle() }}>
                    <Avatar src={u.avatarDataUrl} emoji="👤" size={18} />
                    <span style={{ color: "var(--t-text)" }}>{u.name}</span>
                    {!followedUsers.has(u.id) && (
                      <span className="text-[0.6rem] px-0.5 border" style={{ borderColor: "var(--t-accent)", color: "var(--t-accent)" }}>+</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {network.suggestions.length > 0 && (
              <>
                <div className="text-xs mb-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Suggestions</div>
                <div className="flex flex-wrap gap-1">
                  {network.suggestions.map((u) => (
                    <button key={u.id} onClick={() => { playClick(); onFollowUser(u.id, u.name); }} className="flex items-center gap-1 px-1.5 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-display)", ...raisedStyle(false) }}>
                      <Avatar src={u.avatarDataUrl} emoji="👤" size={18} />
                      <span style={{ color: "var(--t-text)" }}>{u.name}</span>
                      <span style={{ color: "var(--t-accent)" }}>+ Suivre</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recommandations */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="px-2 py-1 text-sm flex-1 mr-1" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
            🏆 Recommandations ({recommendations.length})
          </div>
          {user && (
            <button onClick={() => { playClick(); onShowAddRecommendation(); }} className="px-1.5 py-0.5 text-xs border-2 shrink-0" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>+ Rédiger</button>
          )}
        </div>
        {recommendations.length === 0 ? (
          <div className="text-xs text-center py-2 border-2" style={{ ...sunkenStyle(), fontFamily: "var(--t-font-display)", color: "var(--t-text-subtle)" }}>
            Aucune recommandation. Même votre mère n&apos;en a pas laissé.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="mb-1.5 p-2 border-2" style={{ ...sunkenStyle() }}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-bold" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-display)" }}>{rec.fromName}</span>
                  <span className="text-[0.6rem] ml-1" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{rec.relationship}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[0.6rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{timeAgo(rec.createdAt)}</span>
                  {user && (user.id === rec.fromUserId) && (
                    <button onClick={() => onDeleteRecommendation(rec.id)} className="px-1 text-xs border-2 opacity-40 hover:opacity-100" style={{ ...raisedStyle() }}>✕</button>
                  )}
                </div>
              </div>
              <div className="text-xs leading-snug" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-body)" }}>&ldquo;{rec.content}&rdquo;</div>
            </div>
          ))
        )}
      </div>

      <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <button onClick={() => { playBip(); onShowPremium(); }} className="w-full text-center px-2 py-1 text-xs border-2" style={{ ...sunkenStyle(), color: "var(--t-app-text-muted)", fontFamily: "var(--t-font-display)" }}>
          🏅 Badge &quot;Top Voice&quot; disponible avec Premium (29,99€/mois)
        </button>
      </div>
    </div>
  );
}
