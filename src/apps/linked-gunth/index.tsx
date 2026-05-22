"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import type { AppProps } from "@/types";

import type { Post, Reaction, Tab, Experience, Recommendation, ProfileData, ProfileView, NetworkUser, ViewedProfile } from "./types";
import { NOTIF_TEMPLATES, TABS, TITLEBAR_GRADIENT, AI_POST_SUGGESTIONS } from "./constants";
import { pick, totalReactions } from "./helpers";

import { SearchBar } from "./components/SearchBar";
import { Toast, Confetti, ConnectionRequestPopup, DialogShell } from "./components/Toast";
import { ProfilePage } from "./components/ProfilePage";
import { ProfilEditDialog, AddExperienceDialog, AddRecommendationDialog } from "./components/Dialogs";
import { FeedTab } from "./tabs/FeedTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { MessagesTab } from "./tabs/MessagesTab";
import { ProfilTab } from "./tabs/ProfilTab";
import { raisedStyle, sunkenStyle } from "./helpers";
import { INMAIL_TEMPLATES } from "./constants";

export function LinkedGunthApp(_: AppProps) {
  const { user } = useAuth();
  const { playClick, playPop, playDelete, playVictory, playBip } = useSoundContext();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("feed");
  const [viewedProfile, setViewedProfile] = useState<ViewedProfile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // ── Feed state ──────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [postViewCounts, setPostViewCounts] = useState<Record<number, number>>({});
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [followersCount, setFollowersCount] = useState(0);

  // ── Notifications state ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<{ id: number; text: string; icon: string; read: boolean }[]>([]);
  const [notifBounce, setNotifBounce] = useState(false);

  // ── Messages state ──────────────────────────────────────────────────────────
  const [showInMail, setShowInMail] = useState(false);
  const [inMailRead, setInMailRead] = useState(false);
  const [inMailIndex, setInMailIndex] = useState(0);
  const [inMailReplied, setInMailReplied] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [sandrineSeen, setSandrineSeen] = useState(false);

  // ── Profile state ───────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [profileViews, setProfileViews] = useState<ProfileView[]>([]);
  const [profileViewCount, setProfileViewCount] = useState(0);
  const [endorsementCounts, setEndorsementCounts] = useState<Record<string, number>>({});
  const [myEndorsements, setMyEndorsements] = useState<string[]>([]);
  const [endorsedSkills, setEndorsedSkills] = useState<Record<number, number>>({});
  const [openToWork, setOpenToWork] = useState(false);
  const [network, setNetwork] = useState<{ following: NetworkUser[]; followers: NetworkUser[]; suggestions: NetworkUser[]; followingIds: string[]; followerIds: string[] } | null>(null);
  const [showProfilEdit, setShowProfilEdit] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddRecommendation, setShowAddRecommendation] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [connectionRequest, setConnectionRequest] = useState<{ name: string; title: string; emoji: string; mutual: number } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewCountRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unread = notifications.filter((n) => !n.read).length;

  const showToast = useCallback((msg: string) => { setToast(msg); }, []);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/linked-gunth/posts?limit=30");
      if (!res.ok) return;
      const data = (await res.json()) as { posts: Post[] };
      setPosts(data.posts);
    } catch { /* ignore */ } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/linked-gunth/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as { notifications: { id: number; text: string; icon: string; read: boolean }[] };
      setNotifications(data.notifications);
    } catch { /* ignore */ }
  }, [user]);

  const fetchFollows = useCallback(async () => {
    if (!user) return;
    try {
      const [countRes, networkRes] = await Promise.all([
        fetch(`/api/linked-gunth/follows?userId=${user.id}`),
        fetch(`/api/linked-gunth/follows?network=1`),
      ]);
      if (countRes.ok) {
        const data = (await countRes.json()) as { followers: number };
        setFollowersCount(data.followers);
      }
      if (networkRes.ok) {
        const data = (await networkRes.json()) as { following: NetworkUser[]; followers: NetworkUser[]; suggestions: NetworkUser[]; followingIds: string[]; followerIds: string[] };
        setNetwork(data);
        setFollowedUsers(new Set(data.followingIds));
      }
    } catch { /* ignore */ }
  }, [user]);

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const [profileRes, expRes, recoRes, viewRes, endorseRes] = await Promise.all([
        fetch(`/api/linked-gunth/profile?userId=${user.id}`),
        fetch(`/api/linked-gunth/experiences?userId=${user.id}`),
        fetch(`/api/linked-gunth/recommendations?userId=${user.id}`),
        fetch(`/api/linked-gunth/profile-views?userId=${user.id}`),
        fetch(`/api/linked-gunth/endorsements?userId=${user.id}`),
      ]);
      if (profileRes.ok) {
        const p = (await profileRes.json()) as ProfileData;
        setProfileData(p);
        setOpenToWork(p.openToWork);
      }
      if (expRes.ok) setExperiences((await expRes.json()) as Experience[]);
      if (recoRes.ok) setRecommendations((await recoRes.json()) as Recommendation[]);
      if (viewRes.ok) {
        const v = (await viewRes.json()) as { total: number; views?: ProfileView[] };
        setProfileViewCount(v.total);
        setProfileViews(v.views ?? []);
      }
      if (endorseRes.ok) {
        const e = (await endorseRes.json()) as { counts: Record<string, number>; myEndorsements: string[] };
        setEndorsementCounts(e.counts);
        setMyEndorsements(e.myEndorsements);
      }
    } catch { /* ignore */ }
  }, [user]);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.profile?.avatarDataUrl) setAvatarDataUrl(data.profile.avatarDataUrl); })
      .catch(() => {});
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { fetchFollows(); }, [fetchFollows]);
  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      await fetchPosts();
      await fetchNotifications();
      if (Math.random() > 0.6) {
        const t = pick(NOTIF_TEMPLATES);
        setNotifBounce(true);
        setNotifications((prev) => [{ id: Date.now(), text: t.text, icon: t.icon, read: false }, ...prev.slice(0, 19)]);
        setTimeout(() => setNotifBounce(false), 600);
      }
    }, 30000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchPosts, fetchNotifications]);

  useEffect(() => {
    viewCountRef.current = setInterval(() => {
      setPosts((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * Math.min(prev.length, 6));
        const post = prev[idx]!;
        setPostViewCounts((vc) => ({ ...vc, [post.id]: (vc[post.id] ?? Math.floor(1 + Math.random() * 80)) + Math.floor(1 + Math.random() * 3) }));
        return prev;
      });
    }, 2800);
    return () => { if (viewCountRef.current) clearInterval(viewCountRef.current); };
  }, []);

  useEffect(() => {
    const delay = 15000 + Math.random() * 15000;
    connectionTimerRef.current = setTimeout(() => {
      const requests = [
        { name: "Jean-Kévin M.", title: "CEO · Fondateur · Disrupteur", emoji: "🦁", mutual: 0 },
        { name: "Nadège B.", title: "Coach de vie · Speaker · Maman", emoji: "🌸", mutual: 2 },
        { name: "Thierry C.", title: "Consultant indépendant · Expert en expertises", emoji: "👔", mutual: 1 },
      ];
      setConnectionRequest(requests[Math.floor(Math.random() * requests.length)]!);
    }, delay);
    return () => { if (connectionTimerRef.current) clearTimeout(connectionTimerRef.current); };
  }, []);

  useEffect(() => {
    if (tab === "messages" && !sandrineSeen) {
      setSandrineSeen(true);
      const t1 = setTimeout(() => setTypingIndicator(true), 1200);
      const t2 = setTimeout(() => setTypingIndicator(false), 5500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    return undefined;
  }, [tab, sandrineSeen]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handlePost() {
    if (!newPostText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch("/api/linked-gunth/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostText.trim() }),
      });
      if (res.ok) {
        playVictory();
        setNewPostText("");
        setShowCompose(false);
        setShowConfetti(true);
        showToast("🚀 Post publié ! Vos 3 relations sont notifiées.");
        await fetchPosts();
      }
    } finally { setPosting(false); }
  }

  function handleAiSuggest() {
    playBip();
    setAiSuggesting(true);
    setTimeout(() => {
      setNewPostText(pick(AI_POST_SUGGESTIONS));
      setAiSuggesting(false);
      showToast("✨ L'IA a généré votre authenticité.");
    }, 1100);
  }

  function handleReact(postId: number, reaction: Reaction) {
    if (!user) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...p.reactions };
        if (p.myReaction === reaction) {
          reactions[reaction] = Math.max(0, (reactions[reaction] ?? 0) - 1);
          return { ...p, myReaction: null, reactions };
        }
        if (p.myReaction) reactions[p.myReaction] = Math.max(0, (reactions[p.myReaction] ?? 0) - 1);
        reactions[reaction] = (reactions[reaction] ?? 0) + 1;
        return { ...p, myReaction: reaction, reactions };
      })
    );
    fetch("/api/linked-gunth/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reaction }),
    });
  }

  function handleEndorseSkill(idx: number) {
    playPop();
    setEndorsedSkills((prev) => ({ ...prev, [idx]: (prev[idx] ?? 0) + 1 }));
    if (Math.random() > 0.6) {
      const names = ["Patrick L.", "Jean-Kévin", "Sandrine R.", "Marc T.", "Nadège B."];
      showToast(`${pick(names)} a validé votre compétence !`);
    }
  }

  async function handleToggleOpenToWork() {
    if (!user) return;
    const next = !openToWork;
    setOpenToWork(next);
    playPop();
    showToast(next ? "🟢 OPEN TO WORK activé !" : "Statut retiré. Bonne chance quand même.");
    await fetch("/api/linked-gunth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openToWork: next }),
    });
  }

  async function handleAddExperience(data: Omit<Experience, "id" | "userId">) {
    const res = await fetch("/api/linked-gunth/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      playVictory();
      showToast("💼 Expérience ajoutée ! Votre CV s'étoffe.");
      await fetchProfileData();
      setShowAddExperience(false);
    } else {
      const err = (await res.json()) as { error?: string };
      showToast(err.error ?? "Erreur");
    }
  }

  async function handleDeleteExperience(id: number) {
    const res = await fetch(`/api/linked-gunth/experiences?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      playDelete();
      showToast("Expérience supprimée. Comme si elle n'avait jamais eu lieu.");
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function handleEndorseUserSkill(toUserId: string, skillName: string) {
    if (!user) return;
    const wasEndorsed = myEndorsements.includes(skillName);
    setMyEndorsements((prev) => wasEndorsed ? prev.filter((s) => s !== skillName) : [...prev, skillName]);
    setEndorsementCounts((prev) => ({
      ...prev,
      [skillName]: Math.max(0, (prev[skillName] ?? 0) + (wasEndorsed ? -1 : 1)),
    }));
    playPop();
    const res = await fetch("/api/linked-gunth/endorsements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, skillName }),
    });
    if (res.ok && !wasEndorsed) showToast(`👍 Vous avez validé "${skillName}"`);
  }

  async function handleAddRecommendation(toUserId: string, content: string, relationship: string) {
    const res = await fetch("/api/linked-gunth/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, content, relationship }),
    });
    if (res.ok) {
      playVictory();
      showToast("🏆 Recommandation envoyée !");
      setShowAddRecommendation(false);
    } else {
      const err = (await res.json()) as { error?: string };
      showToast(err.error ?? "Erreur");
    }
  }

  async function handleDeleteRecommendation(id: number) {
    const res = await fetch(`/api/linked-gunth/recommendations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      playDelete();
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      showToast("Recommandation supprimée.");
    }
  }

  async function handleFollowUser(authorId: string, authorName: string) {
    if (!user) return;
    const wasFollowing = followedUsers.has(authorId);
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(authorId); else next.add(authorId);
      return next;
    });
    await fetch("/api/linked-gunth/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followedId: authorId }),
    });
    if (!wasFollowing) showToast(`✓ Vous suivez maintenant ${authorName}`);
    void fetchFollows();
  }

  function handleAcceptConnection() {
    if (!connectionRequest) return;
    playVictory();
    setFollowersCount((c) => c + 1);
    showToast(`🤝 Connexion acceptée ! Vous avez maintenant ${followersCount + 1} relations.`);
    setNotifications((prev) => [{ id: Date.now(), text: `${connectionRequest.name} a rejoint votre réseau`, icon: "🤝", read: false }, ...prev.slice(0, 19)]);
    setNotifBounce(true);
    setTimeout(() => setNotifBounce(false), 600);
    setConnectionRequest(null);
  }

  async function handleMarkAllRead() {
    playClick();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/linked-gunth/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: null }),
    });
  }

  async function handleMarkOneRead(id: number) {
    playClick();
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await fetch("/api/linked-gunth/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleDeleteNotif(id: number) {
    playDelete();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/linked-gunth/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handleSaveProfileField(field: "headline" | "location", value: string) {
    setProfileData((prev) => prev ? { ...prev, [field]: value || null } : prev);
    await fetch("/api/linked-gunth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
  }

  // ── Render profile view ─────────────────────────────────────────────────────

  if (viewedProfile) {
    return (
      <ProfilePage
        profile={viewedProfile}
        onBack={() => setViewedProfile(null)}
        currentUserId={user?.id ?? null}
        playClick={playClick}
        followedUsers={followedUsers}
        onFollowUser={handleFollowUser}
      />
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-bg)", minHeight: 0 }}>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-1 px-2 py-1 border-b-2" style={{ ...TITLEBAR_GRADIENT, borderColor: "var(--t-border-dark)" }}>
        <div className="font-bold text-lg tracking-wide px-2 py-0.5 border-2 mr-1 shrink-0" style={{ fontFamily: "var(--t-font-display)", backgroundColor: "transparent", borderTopColor: "rgba(255,255,255,0.5)", borderLeftColor: "rgba(255,255,255,0.5)", borderBottomColor: "rgba(0,0,0,0.4)", borderRightColor: "rgba(0,0,0,0.4)", color: "var(--t-titlebar-text)" }}>
          linked<span style={{ color: "var(--t-accent-hover, var(--t-accent))", filter: "brightness(1.4)" }}>Gunth</span>
        </div>

        <SearchBar playBip={playBip} showToast={showToast} />
        <div className="flex-1" />

        {TABS.map(({ id, icon, label }) => {
          const badge = id === "notifications" ? unread : id === "messages" && !inMailRead ? 1 : 0;
          const active = tab === id;
          return (
            <button key={id} onClick={() => { playClick(); setTab(id); }} className="relative flex flex-col items-center px-2.5 py-0.5 text-[0.7rem] border-2 min-w-[48px]" style={{ fontFamily: "var(--t-font-display)", borderTopColor: active ? "rgba(0,0,0,0.4)" : "transparent", borderLeftColor: active ? "rgba(0,0,0,0.4)" : "transparent", borderBottomColor: active ? "rgba(255,255,255,0.3)" : "transparent", borderRightColor: active ? "rgba(255,255,255,0.3)" : "transparent", backgroundColor: active ? "rgba(0,0,0,0.25)" : "transparent", color: "var(--t-titlebar-text)" }}>
              <span className={id === "notifications" && notifBounce ? "animate-[blink_0.12s_step-end_4]" : ""}>{icon}</span>
              <span style={{ opacity: active ? 1 : 0.8 }}>{label}</span>
              {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[0.6rem] font-bold px-1 border" style={{ backgroundColor: "var(--t-badge-bg)", color: "var(--t-badge-text)", borderColor: "var(--t-titlebar-text)" }}>
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}

        <button onClick={() => { playBip(); setShowPremium(true); }} className="ml-1 px-2 py-0.5 text-sm border-2 shrink-0" style={{ fontFamily: "var(--t-font-display)", borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-card-hover-border, var(--t-accent))", color: "var(--t-titlebar-text)" }}>
          ✨ Premium
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2" style={{ backgroundColor: "var(--t-bg-dark)", minHeight: 0 }}>
        <div className="max-w-xl mx-auto">
          {tab === "feed" && (
            <FeedTab
              user={user}
              posts={posts}
              loading={loading}
              refreshing={refreshing}
              posting={posting}
              newPostText={newPostText}
              showCompose={showCompose}
              aiSuggesting={aiSuggesting}
              expandedPosts={expandedPosts}
              followedUsers={followedUsers}
              postViewCounts={postViewCounts}
              setExpandedPosts={setExpandedPosts}
              setNewPostText={setNewPostText}
              setShowCompose={setShowCompose}
              onPost={handlePost}
              onRefresh={() => fetchPosts(true)}
              onReact={handleReact}
              onFollowUser={handleFollowUser}
              onOpenProfile={setViewedProfile}
              onShowToast={showToast}
              playClick={playClick}
              playPop={playPop}
              playBip={playBip}
              playVictory={playVictory}
              showConfetti={showConfetti}
              onAiSuggest={handleAiSuggest}
              totalReactions={totalReactions}
            />
          )}

          {tab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkOneRead={handleMarkOneRead}
              onDeleteNotif={handleDeleteNotif}
              onShowPremium={() => setShowPremium(true)}
            />
          )}

          {tab === "messages" && (
            <MessagesTab
              followersCount={followersCount}
              inMailRead={inMailRead}
              inMailIndex={inMailIndex}
              inMailReplied={inMailReplied}
              showInMail={showInMail}
              typingIndicator={typingIndicator}
              onOpenInMail={() => { playClick(); setShowInMail(true); setInMailRead(true); setInMailIndex(Math.floor(Math.random() * INMAIL_TEMPLATES.length)); }}
              onCloseInMail={() => { setShowInMail(false); setInMailReplied(false); }}
              onReplyInMail={() => setInMailReplied(true)}
              onIgnoreInMail={() => setShowInMail(false)}
              onShowToast={showToast}
              playClick={playClick}
              playVictory={playVictory}
              playDelete={playDelete}
            />
          )}

          {tab === "profil" && (
            <ProfilTab
              user={user}
              avatarDataUrl={avatarDataUrl}
              profileData={profileData}
              experiences={experiences}
              recommendations={recommendations}
              profileViews={profileViews}
              profileViewCount={profileViewCount}
              followersCount={followersCount}
              endorsementCounts={endorsementCounts}
              myEndorsements={myEndorsements}
              endorsedSkills={endorsedSkills}
              openToWork={openToWork}
              network={network}
              followedUsers={followedUsers}
              onToggleOpenToWork={handleToggleOpenToWork}
              onDeleteExperience={handleDeleteExperience}
              onEndorseSkill={handleEndorseSkill}
              onEndorseUserSkill={handleEndorseUserSkill}
              onDeleteRecommendation={handleDeleteRecommendation}
              onFollowUser={handleFollowUser}
              onShowProfilEdit={() => setShowProfilEdit(true)}
              onShowAddExperience={() => setShowAddExperience(true)}
              onShowAddRecommendation={() => setShowAddRecommendation(true)}
              onShowPremium={() => setShowPremium(true)}
              onOpenProfile={setViewedProfile}
              onSaveField={handleSaveProfileField}
              playClick={playClick}
              playBip={playBip}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex justify-between items-center px-2 py-0.5 text-xs border-t-2" style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)", fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <span>🔗 linkedGunth.exe · {posts.length} posts</span>
        <span className="animate-[blink_2s_step-end_infinite]">● {user ? `Connecté · ${followersCount} relations` : "Non connecté"} · 0 opportunités</span>
      </div>

      {/* Overlays */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {connectionRequest && (
        <ConnectionRequestPopup
          request={connectionRequest}
          onAccept={handleAcceptConnection}
          onDecline={() => { playDelete(); showToast("Invitation ignorée. Ils ne le sauront jamais."); setConnectionRequest(null); }}
        />
      )}

      {showProfilEdit && (
        <ProfilEditDialog
          initialHeadline={profileData?.headline ?? null}
          initialLocation={profileData?.location ?? null}
          onClose={() => setShowProfilEdit(false)}
          onSaved={(headline, location) => {
            setProfileData((prev) => prev ? { ...prev, headline: headline || null, location: location || null } : prev);
          }}
          playClick={playClick}
          playPop={playPop}
        />
      )}

      {showAddExperience && (
        <AddExperienceDialog
          onClose={() => { playClick(); setShowAddExperience(false); }}
          onSubmit={handleAddExperience}
          playClick={playClick}
          playPop={playPop}
        />
      )}

      {showAddRecommendation && user && (
        <AddRecommendationDialog
          currentUserId={user.id}
          onClose={() => { playClick(); setShowAddRecommendation(false); }}
          onSubmit={handleAddRecommendation}
          playClick={playClick}
          playPop={playPop}
        />
      )}

      {showPremium && (
        <DialogShell title="✨ linkedGunth Premium™" onClose={() => { playClick(); setShowPremium(false); }} width="380px">
          <div className="text-center mb-2">
            <div className="text-4xl">👑</div>
            <div className="font-bold text-lg" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>29,99€ / mois</div>
            <div className="text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>sans engagement — résiliation en 47 étapes</div>
          </div>
          <div className="p-2 mb-2 border-2" style={{ ...sunkenStyle() }}>
            {[
              "✅ InMails illimités (réponse non garantie)",
              "✅ Voir qui a regardé votre profil (pour pleurer)",
              "✅ Badge doré sur votre photo",
              "✅ 500+ relations (chiffre fictif)",
              "✅ Cours LinkedIn Learning sur Excel",
              "✅ Notifications ×10",
              "❌ Trouver un emploi (non inclus)",
            ].map((item) => (
              <div key={item} className="text-sm mb-0.5" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-display)" }}>{item}</div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => { playVictory(); setShowPremium(false); showToast("💳 Paiement refusé. Votre banque vous remercie."); }} className="flex-1 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>S&apos;abonner 💳</button>
            <button onClick={() => { playClick(); setShowPremium(false); showToast("Sage décision."); }} className="px-3 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Rester pauvre</button>
          </div>
        </DialogShell>
      )}
    </div>
  );
}
