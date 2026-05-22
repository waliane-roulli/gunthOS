"use client";

import { useState, useEffect, useMemo } from "react";
import type { ViewedProfile } from "../types";
import { raisedStyle, sunkenStyle } from "../helpers";
import { BOT_FAKE_TITLES, BOT_FAKE_COMPANIES } from "../constants";
import { VALID_SKILLS } from "@/lib/linked-gunth-constants";
import { Avatar } from "./Avatar";
import { seededPick } from "../helpers";

function generateBotExperiences(name: string): { title: string; company: string; startYear: number; endYear: number | null; isCurrent: boolean }[] {
  const seed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const count = 2 + (seed % 2);
  const exps = [];
  let year = 2024;
  for (let i = 0; i < count; i++) {
    const duration = 1 + ((seed + i * 7) % 4);
    const isCurrent = i === 0;
    exps.push({
      title: seededPick(BOT_FAKE_TITLES, seed, i * 3),
      company: seededPick(BOT_FAKE_COMPANIES, seed, i * 7),
      startYear: year - duration,
      endYear: isCurrent ? null : year,
      isCurrent,
    });
    year -= duration + 1;
  }
  return exps;
}

function generateBotSkills(name: string): { skill: string; count: number }[] {
  const seed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const picked: { skill: string; count: number }[] = [];
  const used = new Set<number>();
  for (let i = 0; picked.length < 5; i++) {
    const idx = Math.abs(seed * 13 + i * 17) % VALID_SKILLS.length;
    if (!used.has(idx)) {
      used.add(idx);
      picked.push({ skill: VALID_SKILLS[idx] as string, count: 50 + Math.abs(seed * 7 + i * 11) % 450 });
    }
  }
  return picked;
}

export function ProfilePage({ profile, onBack, currentUserId, playClick, followedUsers, onFollowUser }: {
  profile: ViewedProfile;
  onBack: () => void;
  currentUserId: string | null;
  playClick: () => void;
  followedUsers: Set<string>;
  onFollowUser: (id: string, name: string) => void;
}) {
  const isBot = profile.kind === "bot";
  const name = profile.name;
  const emoji = isBot ? profile.emoji : "👤";
  const title = isBot ? profile.title : null;

  const [userData, setUserData] = useState<{
    profile: { headline: string | null; location: string | null; openToWork: boolean };
    experiences: { id: number; title: string; company: string; startYear: number; endYear: number | null; isCurrent: boolean }[];
    endorsedSkills: string[];
    followersCount: number;
    user: { avatarDataUrl: string | null; username: string | null };
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(!isBot);

  useEffect(() => {
    if (isBot || profile.kind !== "user") return;
    fetch(`/api/linked-gunth/public-profile?userId=${profile.userId}`)
      .then((r) => r.json())
      .then((d) => { setUserData(d); setLoadingUser(false); });
  }, [isBot, profile]);

  const botExps = useMemo(() => isBot ? generateBotExperiences(name) : null, [isBot, name]);
  const botSkills = useMemo(() => isBot ? generateBotSkills(name) : null, [isBot, name]);

  const headline = isBot ? title : (userData?.profile.headline ?? null);
  const location = isBot ? "Paris, Île-de-France" : (userData?.profile.location ?? null);
  const openToWork = isBot ? false : (userData?.profile.openToWork ?? false);
  const experiences = isBot ? botExps! : (userData?.experiences ?? []);
  const skills = isBot ? botSkills! : (userData?.endorsedSkills.map((s) => ({ skill: s, count: 1 })) ?? []);
  const followersCount = isBot ? (name.length * 31 + 42) % 900 + 100 : (userData?.followersCount ?? 0);

  const isFollowed = !isBot && profile.kind === "user" ? followedUsers.has(profile.userId) : false;
  const isMe = !isBot && profile.kind === "user" && profile.userId === currentUserId;

  function handleFollow() {
    if (isBot || profile.kind !== "user") return;
    playClick();
    onFollowUser(profile.userId, name);
  }

  if (loadingUser) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
        <span className="animate-[blink_1s_step-end_infinite] text-2xl">⏳</span>
        <div className="mt-2 text-xs">Chargement du profil…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ backgroundColor: "var(--t-bg-dark)" }}>
      <div className="shrink-0 flex items-center gap-1 px-2 py-1 border-b-2" style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
        <button onClick={() => { playClick(); onBack(); }} className="px-2 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-display)", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
          ← Retour
        </button>
        <span className="text-xs ml-1" style={{ color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)" }}>Profil de {name}</span>
      </div>

      <div className="flex-1 p-2">
        <div className="max-w-xl mx-auto">
          <div className="overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
            <div className="h-14 relative" style={{ background: "linear-gradient(135deg, var(--t-titlebar-from), var(--t-titlebar-to))" }}>
              {openToWork && (
                <div className="absolute bottom-1 left-2 text-[0.6rem] px-1.5 py-0.5 animate-[blink_2s_step-end_infinite]" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)" }}>
                  🟢 OPEN TO WORK
                </div>
              )}
              {isBot && (
                <div className="absolute top-1 right-1 text-[0.6rem] px-1 border" style={{ borderColor: "var(--t-accent)", color: "var(--t-accent)", fontFamily: "var(--t-font-display)", backgroundColor: "var(--t-bg)" }}>
                  500+ relations
                </div>
              )}
            </div>

            <div className="px-3 pb-3 -mt-5">
              <Avatar src={!isBot ? (userData?.user.avatarDataUrl ?? null) : null} emoji={emoji} size={52} />
              <div className="mt-2 flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{name}</div>
                  {headline && <div className="text-sm leading-tight" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{headline}</div>}
                  {location && <div className="text-xs mt-0.5" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>📍 {location}</div>}
                  <div className="text-xs mt-0.5" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>{followersCount} relations</div>
                </div>
                {!isMe && !isBot && (
                  <button onClick={handleFollow} className="shrink-0 px-2 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-display)", borderTopColor: isFollowed ? "var(--t-border-dark)" : "var(--t-border-light)", borderLeftColor: isFollowed ? "var(--t-border-dark)" : "var(--t-border-light)", borderBottomColor: isFollowed ? "var(--t-border-light)" : "var(--t-border-dark)", borderRightColor: isFollowed ? "var(--t-border-light)" : "var(--t-border-dark)", backgroundColor: isFollowed ? "rgba(0,0,0,0.1)" : "var(--t-bg)" }}>
                    {isFollowed ? "✓ Abonné" : "+ Suivre"}
                  </button>
                )}
              </div>
            </div>

            <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
              <div className="px-2 py-1 text-sm mb-2" style={{ background: "linear-gradient(90deg, var(--t-titlebar-from), var(--t-titlebar-to))", fontFamily: "var(--t-font-display)", color: "var(--t-titlebar-text)" }}>
                💼 Expériences
              </div>
              {experiences.length === 0 ? (
                <div className="text-xs text-center py-2" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>Aucune expérience renseignée.</div>
              ) : (
                experiences.map((exp, i) => (
                  <div key={i} className="mb-2 pb-2 border-b last:border-0" style={{ borderColor: "var(--t-border-dark)" }}>
                    <div className="text-xs font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{exp.title}</div>
                    <div className="text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{exp.company}</div>
                    <div className="text-[0.65rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
                      {exp.startYear} – {exp.isCurrent ? "présent" : exp.endYear}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
              <div className="px-2 py-1 text-sm mb-2" style={{ background: "linear-gradient(90deg, var(--t-titlebar-from), var(--t-titlebar-to))", fontFamily: "var(--t-font-display)", color: "var(--t-titlebar-text)" }}>
                🏅 Compétences
              </div>
              {skills.length === 0 ? (
                <div className="text-xs text-center py-2" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>Aucune compétence validée.</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {skills.map(({ skill, count }) => (
                    <div key={skill} className="flex items-center gap-1 px-1.5 py-0.5 border-2 text-[0.65rem]" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", fontFamily: "var(--t-font-display)", color: "var(--t-text)" }}>
                      {skill}
                      {count > 1 && <span style={{ color: "var(--t-accent)" }}>· {count}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
