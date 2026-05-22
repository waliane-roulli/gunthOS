"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSoundContext } from "@/lib/contexts/sound-context";
import type { AppProps } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

type Reaction = "Inspirant" | "Bravo" | "Fascinant";
type Tab = "feed" | "notifications" | "messages" | "profil";

interface Experience {
  id: number;
  userId: string;
  title: string;
  company: string;
  startYear: number;
  endYear: number | null;
  isCurrent: boolean;
  description: string | null;
}

interface Recommendation {
  id: number;
  fromUserId: string;
  fromName: string;
  fromUsername: string | null;
  content: string;
  relationship: string;
  createdAt: string;
}

interface ProfileData {
  userId: string;
  openToWork: boolean;
  headline: string | null;
  location: string | null;
}

interface ProfileView {
  id: number;
  botName: string | null;
  botTitle: string | null;
  botEmoji: string | null;
  viewerName: string | null;
  viewerUserId: string | null;
  viewedAt: string;
}

interface Post {
  id: number;
  authorId: string | null;
  botName: string | null;
  botTitle: string | null;
  botAvatar: string | null;
  content: string;
  createdAt: string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatar: string | null;
  reactions: Record<string, number>;
  myReaction: Reaction | null;
  commentCount: number;
}

interface Comment {
  id: number;
  postId: number;
  authorId: string | null;
  botName: string | null;
  botAvatar: string | null;
  content: string;
  parentId: number | null;
  likes: number;
  iLiked: boolean;
  createdAt: string;
  authorName: string | null;
  authorAvatar: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const NOTIF_TEMPLATES = [
  { text: "Patrick Lemaire a consulté votre profil", icon: "👀" },
  { text: "Jean-Kévin vous a envoyé un InMail sans vous lire", icon: "📧" },
  { text: "Votre post a eu 1 vue (c'était vous)", icon: "📊" },
  { text: "Quelqu'un a ignoré votre invitation depuis 3 semaines", icon: "🙃" },
  { text: "Marc Technologie a partagé quelque chose d'inspirant", icon: "🚀" },
  { text: "Rappel : votre profil est incomplet depuis 2021", icon: "⚠️" },
  { text: "Nadège Blondel a validé votre compétence 'Réunions debout'", icon: "👍" },
  { text: "Vous avez été mentionné dans un post que vous ne lirez jamais", icon: "🔔" },
  { text: "Bruno Disruptif a vu votre profil 3 fois ce matin", icon: "😰" },
  { text: "Félicitations ! Votre post a 0 commentaires mais 1 vue", icon: "🎊" },
  { text: "Karine R. veut vous ajouter à son réseau professionnel de 500+", icon: "🤝" },
  { text: "Thierry Consultant a validé 'Leadership Bienveillant'", icon: "✨" },
  { text: "Vous avez atteint le rang Inférieur à la Moyenne™", icon: "🏅" },
];

const COMMENT_RESPONSES = [
  "Merci pour ce partage inspirant ! 🙏",
  "Tellement vrai. J'ai vécu exactement la même chose après ma reconversion.",
  "Je partage entièrement cette vision disruptive.",
  "Ça donne à réfléchir. Bravo pour le courage de le dire.",
  "Excellent contenu ! Je le partage avec mon réseau de 3 personnes.",
  "C'est exactement ce dont le monde professionnel a besoin.",
  "J'ai quitté mon CDI pour ça. Pas de regrets. 🚀",
  "Powerful. Just powerful.",
  "Vous avez résumé ce que je ressens depuis 5 ans en 3 lignes. Merci.",
  "Je valide à 100%. Mon coach m'a dit la même chose.",
  "+1 👆",
];

const SHARE_TOASTS = [
  "Partagé avec vos 3 relations !",
  "Vos 3 abonnés seront ravis.",
  "Partagé ! (vu par personne)",
  "Republié pour maximiser le reach.",
  "3 personnes seront inspirées 🚀",
];

const ENTHUSIASTIC_REPLIES = [
  `Bonjour Sandrine !

Merci beaucoup pour votre message, je suis absolument ravi(e) d'avoir retenu votre attention parmi les milliers de profils que vous avez cherchés sur LinkedGunth.

Le secteur de l'innovation innovante m'a toujours passionné(e), et l'idée de rejoindre une équipe de [NOMBRE] personnes dans un environnement dynamique me comble de joie.

Disponible cette semaine, la prochaine, ou n'importe quand tant que le café est gratuit.

Cordialement,
[PRÉNOM] ✨`,

  `Bonjour Sandrine,

Votre message a illuminé ma matinée comme un slide PowerPoint en Comic Sans.

Le poste de [POSTE] semble parfaitement aligné avec mes synergies disruptives et ma capacité à tenir debout en réunion.

Je suis disponible lundi en présentiel bien sûr.

À très vite,
[PRÉNOM] 🤝`,
];

const INMAIL_TEMPLATES = [
  `Bonjour [PRÉNOM],

Je suis Sandrine, Talent Acquisition Manager chez une entreprise innovante du secteur de l'innovation innovante.

Votre profil a retenu mon attention (j'ai cherché "CDI Paris" sur LinkedGunth).

Nous recherchons un(e) [POSTE] passionné(e) pour rejoindre une équipe de [NOMBRE] personnes dans un environnement dynamique et start-up.

Package : selon profil
Télétravail : hybride (lundi en présentiel obligatoire)
Avantages : café gratuit, babyfoot

Êtes-vous disponible pour un échange de 30 minutes cette semaine ?

Cordialement,
Sandrine R.
🔗 linkedGunth : 500+ relations`,
  `Bonjour [PRÉNOM],

Je suis Marc, Head of Talent chez ScaleFast™ — une scale-up qui scale vite.

Votre parcours unique m'a frappé(e) de plein fouet. Nous construisons quelque chose de différent ici.

Mission : "Transformer la transformation digitale"
Stack : Agile, Lean, Kanban, Post-its
Avantages : Ping-pong, Kombucha, 1 journée de télétravail par mois si météo favorable

Êtes-vous "open to talk" ?

Sportivement,
Marc T.
🎯 Recruteur · 500+ relations · Top Voice 2023`,
];

const AI_POST_SUGGESTIONS = [
  `J'ai tout quitté.
.
.
.
Pour créer quelque chose.
.
.
.
(Je cherche un CDI en urgence)`,
  `Il y a 3 ans, j'étais au fond du gouffre.
.
.
Aujourd'hui je gagne 2x moins mais je suis épanoui(e).
.
.
#entrepreneuriat #courage #quitterSonCDI`,
  `Ce matin j'ai refusé une offre à 80k.
.
.
Parce que l'ambiance ne matchait pas mes valeurs.
.
.
Certains comprendront. 🌱`,
  `La différence entre ceux qui réussissent et les autres ?
.
.
.
.
Les premiers se lèvent le matin.
.
.
🚀 RT si vous êtes d'accord`,
  `Mon manager m'a dit que j'étais trop passionné(e).
.
.
J'ai démissionné le jour même.
.
.
Meilleure décision de ma vie. (je cherche du travail)`,
  `5 leçons que j'aurais aimé apprendre à 20 ans :
.
1. Le réseau, c'est tout
2. Le réseau, c'est tout
3. Le réseau, c'est tout
4. Excel VLOOKUP
5. Le réseau, c'est tout`,
];

const SEARCH_RESULTS = [
  (q: string) => `Aucun résultat pour "${q}". Avez-vous essayé de networker ?`,
  (q: string) => `247 résultats pour "${q}" (tous inaccessibles sans Premium)`,
  (q: string) => `"${q}" n'existe pas sur linkedGunth. Essayez "synergies".`,
  (q: string) => `Recherche de "${q}"... Sandrine R. a vu cette recherche.`,
  (q: string) => `3 opportunités pour "${q}" expirées il y a 2 ans.`,
];

const CONNECTION_REQUESTS = [
  { name: "Jean-Kévin M.", title: "CEO · Fondateur · Disrupteur", emoji: "🦁", mutual: 0 },
  { name: "Nadège B.", title: "Coach de vie · Speaker · Maman", emoji: "🌸", mutual: 2 },
  { name: "Thierry C.", title: "Consultant indépendant · Expert en expertises", emoji: "👔", mutual: 1 },
  { name: "Bruno D.", title: "Head of Head of Head of Things", emoji: "🧠", mutual: 0 },
  { name: "Sophie LB.", title: "Directrice de la Direction Directoriale", emoji: "💼", mutual: 3 },
];

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "feed", icon: "🏠", label: "Accueil" },
  { id: "notifications", icon: "🔔", label: "Notifs" },
  { id: "messages", icon: "✉️", label: "Messages" },
  { id: "profil", icon: "👤", label: "Moi" },
];

const SKILLS = [
  { name: "Pensée Disruptive", base: 47 },
  { name: "Synergies", base: 31 },
  { name: "Excel (VLOOKUP)", base: 89 },
  { name: "Leadership Bienveillant", base: 23 },
  { name: "Réunions debout", base: 12 },
  { name: "Agilité Mentale", base: 56 },
];

const TITLEBAR_GRADIENT = {
  background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
  color: "var(--t-titlebar-text)",
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "à l'instant";
  if (sec < 3600) return `il y a ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `il y a ${Math.floor(sec / 3600)}h`;
  return `il y a ${Math.floor(sec / 86400)}j`;
}

function totalReactions(reactions: Record<string, number>) {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ── Win98 button style helper ─────────────────────────────────────────────────

function raisedStyle(active = false) {
  return {
    borderTopColor: active ? "var(--t-accent-hover)" : "var(--t-border-light)",
    borderLeftColor: active ? "var(--t-accent-hover)" : "var(--t-border-light)",
    borderBottomColor: "var(--t-border-dark)",
    borderRightColor: "var(--t-border-dark)",
    backgroundColor: active ? "var(--t-accent)" : "var(--t-bg)",
    color: active ? "var(--t-titlebar-text)" : "var(--t-text)",
  };
}

function sunkenStyle() {
  return {
    borderTopColor: "var(--t-border-dark)",
    borderLeftColor: "var(--t-border-dark)",
    borderBottomColor: "var(--t-border-light)",
    borderRightColor: "var(--t-border-light)",
    backgroundColor: "var(--t-app-bg)",
    color: "var(--t-app-text)",
  };
}

// ── Confetti ──────────────────────────────────────────────────────────────────

function Confetti({ onDone }: { onDone: () => void }) {
  const pieces = ["🎉", "⭐", "🚀", "💡", "✨", "🎊", "🏆", "💼"];
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="absolute inset-0 pointer-events-none z-[70] overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-lg"
          style={{
            left: `${5 + (i * 6.2) % 90}%`,
            top: "-20px",
            animation: `fall ${0.9 + (i % 5) * 0.25}s linear ${(i % 8) * 0.12}s forwards`,
          }}
        >
          {pieces[i % pieces.length]}
        </div>
      ))}
      <style>{`@keyframes fall { to { top: 110%; opacity: 0; transform: rotate(${Math.random() > 0.5 ? "" : "-"}${180 + Math.floor(Math.random() * 180)}deg); } }`}</style>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-1.5 border-2 text-sm whitespace-nowrap"
      style={{
        fontFamily: "var(--t-font-display)",
        backgroundColor: "var(--t-accent)",
        color: "var(--t-titlebar-text)",
        borderTopColor: "var(--t-accent-hover)",
        borderLeftColor: "var(--t-accent-hover)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
        animation: "blink 0.12s step-end 1",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDone}
        className="ml-1 opacity-70 hover:opacity-100 leading-none border-none bg-transparent"
        style={{ color: "var(--t-titlebar-text)", fontSize: "1rem" }}
      >✕</button>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ src, emoji, size = 38 }: { src?: string | null; emoji?: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden border-2 shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.5,
        borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
        backgroundColor: "var(--t-app-bg)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (emoji ?? "👤")}
    </div>
  );
}

// ── Dialog shell ──────────────────────────────────────────────────────────────

function DialogShell({ title, onClose, children, width = "420px" }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="overflow-hidden border-2 max-w-[95%]" style={{ width, borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
        <div className="flex justify-between items-center px-2 py-1" style={{ ...TITLEBAR_GRADIENT }}>
          <span style={{ fontFamily: "var(--t-font-display)" }}>{title}</span>
          <button onClick={onClose} className="px-1.5 text-sm border-2" style={{ backgroundColor: "transparent", color: "var(--t-titlebar-text)", borderTopColor: "rgba(255,255,255,0.3)", borderLeftColor: "rgba(255,255,255,0.3)", borderBottomColor: "rgba(0,0,0,0.3)", borderRightColor: "rgba(0,0,0,0.3)" }}>✕</button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

// ── Comment Section ────────────────────────────────────────────────────────────

function CommentItem({ comment, user, onLike, playClick, playPop, replyingTo, setReplyingTo, onSubmitReply, replies }: {
  comment: Comment;
  user: { id: string } | null;
  onLike: (id: number) => void;
  playClick: () => void;
  playPop: () => void;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  onSubmitReply: (parentId: number, text: string) => Promise<void>;
  replies: Comment[];
}) {
  const isBot = !comment.authorId;
  const name = isBot ? comment.botName : (comment.authorName ?? "Anonyme");
  const avatar = isBot ? comment.botAvatar : null;
  const avatarSrc = !isBot ? comment.authorAvatar : null;
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  async function submitReply() {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    await onSubmitReply(comment.id, replyText.trim());
    setReplyText("");
    setSubmitting(false);
    setReplyingTo(null);
  }

  function handleLike() {
    if (!user) return;
    playPop();
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 350);
    onLike(comment.id);
  }

  return (
    <div className="mb-1.5">
      <div className="flex gap-1.5 p-1.5 border-2" style={{ borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-app-bg)" }}>
        <Avatar src={avatarSrc} emoji={avatar ?? "👤"} size={28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-display)" }}>{name}</span>
            {isBot && <span className="text-[0.6rem] px-0.5 border" style={{ borderColor: "var(--t-accent)", color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>500+</span>}
            <span className="text-[0.65rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{timeAgo(comment.createdAt)}</span>
          </div>
          <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-body)" }}>{comment.content}</div>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleLike}
              disabled={!user}
              className="flex items-center gap-0.5 text-[0.65rem] border-none bg-transparent disabled:opacity-40"
              style={{
                color: comment.iLiked ? "var(--t-accent)" : "var(--t-text-muted)",
                fontFamily: "var(--t-font-display)",
                transform: likeAnim ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.15s, color 0.15s",
              }}
            >
              {comment.iLiked ? "❤️" : "🤍"} {comment.likes > 0 ? comment.likes : ""}
            </button>
            {user && (
              <button
                onClick={() => { playClick(); setReplyingTo(replyingTo === comment.id ? null : comment.id); }}
                className="text-[0.65rem] border-none bg-transparent"
                style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
              >
                ↩ Répondre
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-1.5 flex gap-1">
              <div className="flex-1 border-2" style={{ ...sunkenStyle() }}>
                <input
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                  placeholder="Votre réponse..."
                  className="w-full border-none outline-none px-1.5 py-0.5 text-xs"
                  style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}
                  maxLength={300}
                />
              </div>
              <button onClick={submitReply} disabled={!replyText.trim() || submitting} className="px-1.5 py-0.5 text-xs border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
                {submitting ? "..." : "↩"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-4 mt-0.5 border-l-2 pl-1.5" style={{ borderColor: "var(--t-border-dark)" }}>
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-1.5 p-1 mb-0.5 border-2" style={{ borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)", borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)", backgroundColor: "var(--t-bg)" }}>
              <Avatar src={!reply.authorId ? null : reply.authorAvatar} emoji={reply.botAvatar ?? "👤"} size={22} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[0.65rem] font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>
                    {!reply.authorId ? reply.botName : (reply.authorName ?? "Anonyme")}
                  </span>
                  <span className="text-[0.6rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{timeAgo(reply.createdAt)}</span>
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>{reply.content}</div>
                {reply.likes > 0 && (
                  <div className="text-[0.6rem] mt-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>❤️ {reply.likes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



// ── Inline Comment Section ─────────────────────────────────────────────────────

function InlineComments({ postId, user, playClick, playPop }: {
  postId: number;
  user: { id: string; name?: string | null } | null;
  playClick: () => void;
  playPop: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/linked-gunth/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json() as { comments: Comment[] };
        setComments(data.comments);
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function handleSubmit() {
    if (!text.trim() || submitting || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/linked-gunth/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: text.trim() }),
      });
      if (res.ok) { playPop(); setText(""); await fetchComments(); }
    } finally { setSubmitting(false); }
  }

  async function handleQuickComment(response: string) {
    if (!user) return;
    playPop();
    const res = await fetch("/api/linked-gunth/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: response }),
    });
    if (res.ok) await fetchComments();
  }

  async function handleLike(commentId: number) {
    setComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, iLiked: !c.iLiked, likes: c.iLiked ? c.likes - 1 : c.likes + 1 } : c)
    );
    await fetch("/api/linked-gunth/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
  }

  async function handleSubmitReply(parentId: number, replyText: string) {
    if (!user) return;
    const res = await fetch("/api/linked-gunth/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: replyText, parentId }),
    });
    if (res.ok) { playPop(); await fetchComments(); }
  }

  const { topLevel, repliesMap } = useMemo(() => {
    const top: Comment[] = [];
    const map = new Map<number, Comment[]>();
    for (const c of comments) {
      if (c.parentId == null) {
        top.push(c);
      } else {
        const arr = map.get(c.parentId) ?? [];
        arr.push(c);
        map.set(c.parentId, arr);
      }
    }
    return { topLevel: top, repliesMap: map };
  }, [comments]);

  return (
    <div className="border-t-2" style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg-dark)" }}>
      {/* Quick replies */}
      {user && (
        <div className="px-2 pt-1.5 pb-1 flex flex-wrap gap-1">
          {COMMENT_RESPONSES.slice(0, 3).map((r) => (
            <button key={r} onClick={() => handleQuickComment(r)} className="px-1.5 py-0.5 text-[0.62rem] border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>
              {r.length > 24 ? r.slice(0, 24) + "…" : r}
            </button>
          ))}
        </div>
      )}

      {/* Compose */}
      {user && (
        <div className="px-2 pb-1.5 flex gap-1">
          <div className="flex-1 border-2" style={{ ...sunkenStyle() }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
              placeholder="Commentez avec authenticité…"
              maxLength={300}
              className="w-full border-none outline-none px-1.5 py-0.5 text-xs"
              style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}
            />
          </div>
          <button onClick={handleSubmit} disabled={!text.trim() || submitting} className="px-2 py-0.5 text-xs border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
            {submitting ? "…" : "💬"}
          </button>
        </div>
      )}

      {/* Comment list */}
      <div className="px-2 pb-2">
        {loading ? (
          <div className="text-center py-2 text-[0.65rem]" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
            <span className="animate-[blink_1s_step-end_infinite]">⏳</span> chargement…
          </div>
        ) : topLevel.length === 0 ? (
          <div className="text-center py-2 text-[0.65rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
            Aucun commentaire. Soyez le premier.
          </div>
        ) : (
          topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              user={user}
              onLike={handleLike}
              playClick={playClick}
              playPop={playPop}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onSubmitReply={handleSubmitReply}
              replies={repliesMap.get(c.id) ?? []}
            />
          ))
        )}
      </div>

      {!user && (
        <div className="px-2 pb-1.5 text-center text-[0.65rem]" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
          🔒 Connectez-vous pour commenter
        </div>
      )}
    </div>
  );
}

// ── PostCard ───────────────────────────────────────────────────────────────────

function PostCard({ post, user, expandedPosts, setExpandedPosts, handleReact, onShare, followedUsers, onFollowUser, playClick, playPop, viewCount }: {
  post: Post; user: { id: string } | null;
  expandedPosts: Set<number>; setExpandedPosts: React.Dispatch<React.SetStateAction<Set<number>>>;
  handleReact: (postId: number, reaction: Reaction) => void;
  onShare: () => void;
  followedUsers: Set<string>; onFollowUser: (authorId: string, authorName: string) => void;
  playClick: () => void; playPop: () => void; viewCount: number;
}) {
  const isBot = !post.authorId;
  const displayName = isBot ? post.botName : (post.authorName ?? post.authorUsername ?? "Anonyme");
  const displayTitle = isBot ? post.botTitle : "Utilisateur GunthOS";
  const displayAvatar = isBot ? post.botAvatar : null;
  const isMe = post.authorId === user?.id;
  const isExpanded = expandedPosts.has(post.id);
  const isFollowed = post.authorId ? followedUsers.has(post.authorId) : false;
  const lines = post.content.split("\n");
  const preview = lines.slice(0, 5);
  const hasMore = lines.length > 5;
  const [reactionAnim, setReactionAnim] = useState<Reaction | null>(null);
  const [justShared, setJustShared] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const reactionIcons: Record<Reaction, string> = { Inspirant: "💡", Bravo: "👏", Fascinant: "🤩" };
  const reactionCount = (r: Reaction) => post.reactions[r] ?? 0;
  const totalR = totalReactions(post.reactions);

  function handleReactWithAnim(r: Reaction) {
    if (!user) return;
    playPop();
    setReactionAnim(r);
    setTimeout(() => setReactionAnim(null), 400);
    handleReact(post.id, r);
  }

  function handleFollow() {
    if (!post.authorId || !displayName) return;
    playClick();
    onFollowUser(post.authorId, displayName);
  }

  function handleShare() {
    playClick();
    setJustShared(true);
    setTimeout(() => setJustShared(false), 1800);
    onShare();
  }

  return (
    <div className="mb-1.5 overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
      {/* Author */}
      <div className="flex items-start gap-2 p-2">
        <Avatar src={post.authorAvatar} emoji={displayAvatar ?? "👤"} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)" }}>{displayName}</span>
            {isBot && <span className="text-[0.65rem] px-1 border" style={{ borderColor: "var(--t-accent)", color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>500+</span>}
            {isMe && <span className="text-[0.65rem] px-1" style={{ backgroundColor: "var(--t-accent)", color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)" }}>VOUS</span>}
          </div>
          <div className="text-xs leading-tight" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{displayTitle}</div>
          <div className="text-[0.7rem] flex items-center gap-1.5" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
            <span>{timeAgo(post.createdAt)} · 🌐</span>
            <span style={{ color: "var(--t-text-subtle)", opacity: 0.7 }}>· 👁 {viewCount.toLocaleString("fr-FR")} vues</span>
          </div>
        </div>
        {!isMe && (
          <button onClick={handleFollow} className="text-[0.72rem] px-2 py-0.5 border-2 shrink-0 transition-all" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(isFollowed) }}>
            {isFollowed ? "✓ Abonné" : "+ Suivre"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-2.5 pb-2 text-sm leading-relaxed" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>
        {(isExpanded ? lines : preview).map((line, i) => (
          <div key={i} style={{ minHeight: line === "." ? "0.5em" : undefined, color: line === "." ? "transparent" : "var(--t-text)" }}>
            {line === "." ? "·" : line}
          </div>
        ))}
        {hasMore && !isExpanded && (
          <button onClick={() => { playClick(); setExpandedPosts((prev) => new Set([...prev, post.id])); }} className="text-sm bg-transparent border-none p-0" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>
            …voir plus
          </button>
        )}
      </div>

      {/* Reaction counts */}
      {totalR > 0 && (
        <div className="px-2.5 py-1 flex gap-2 text-xs border-y" style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", backgroundColor: "var(--t-bg-light)" }}>
          {(["Inspirant", "Bravo", "Fascinant"] as Reaction[]).map((r) =>
            reactionCount(r) > 0 ? (
              <span key={r} style={{ display: "inline-block", transform: reactionAnim === r ? "scale(1.35)" : "scale(1)", transition: "transform 0.15s", fontWeight: post.myReaction === r ? "bold" : undefined, color: post.myReaction === r ? "var(--t-accent)" : undefined }}>
                {reactionIcons[r]} {reactionCount(r).toLocaleString("fr-FR")}
              </span>
            ) : null
          )}
          {post.commentCount > 0 && (
            <span style={{ color: "var(--t-text-subtle)" }}>· 💬 {post.commentCount}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-0.5 p-1" style={{ backgroundColor: "var(--t-bg-dark)" }}>
        {(["Inspirant", "Bravo", "Fascinant"] as Reaction[]).map((r) => {
          const active = post.myReaction === r;
          return (
            <button key={r} onClick={() => handleReactWithAnim(r)} disabled={!user} className="flex-1 flex items-center justify-center gap-1 py-1 text-[0.78rem] border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(active), transform: reactionAnim === r ? "scale(0.93)" : "scale(1)", transition: "transform 0.1s, background-color 0.15s" }}>
              {reactionIcons[r]} {r}
            </button>
          );
        })}
        <button
          onClick={() => { playClick(); setShowComments((v) => !v); }}
          className="flex-1 flex items-center justify-center gap-1 py-1 text-[0.78rem] border-2"
          style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(showComments) }}
        >
          💬{post.commentCount > 0 ? ` ${post.commentCount}` : ""}
        </button>
        <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1 py-1 text-[0.78rem] border-2 transition-all" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(justShared) }}>
          {justShared ? "✓ Partagé" : "↗ Partager"}
        </button>
      </div>

      {/* Inline comments */}
      {showComments && (
        <InlineComments postId={post.id} user={user} playClick={playClick} playPop={playPop} />
      )}
    </div>
  );
}

// ── Profil Edit Dialog ─────────────────────────────────────────────────────────

function ProfilEditDialog({ onClose, playClick, playPop }: { onClose: () => void; playClick: () => void; playPop: () => void; }) {
  const [saved, setSaved] = useState(false);
  const fields = [
    { label: "Titre de poste", placeholder: "Chief Disruption Officer" },
    { label: "Slogan personnel", placeholder: "Je ne cherche pas un emploi, je cherche un sens." },
    { label: "Passion principale", placeholder: "Entrepreneuriat / Paddle / Méditation" },
    { label: "Réalisations", placeholder: "J'ai transformé un Excel en startup." },
  ];

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
          {fields.map((f) => (
            <div key={f.label} className="mb-2">
              <div className="text-xs mb-0.5" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{f.label}</div>
              <div className="border-2" style={{ ...sunkenStyle() }}>
                <input type="text" placeholder={f.placeholder} className="w-full border-none outline-none px-2 py-1 text-sm" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
              </div>
            </div>
          ))}
          <div className="text-xs mt-1 mb-2" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>* Les champs vides seront remplis par l&apos;IA Premium (29,99€/mois)</div>
          <div className="flex gap-1.5 justify-end">
            <button onClick={() => { playClick(); onClose(); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Annuler</button>
            <button onClick={() => { playPop(); setSaved(true); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>💾 Enregistrer</button>
          </div>
        </>
      )}
    </DialogShell>
  );
}

// ── Connection Request Popup ──────────────────────────────────────────────────

function ConnectionRequestPopup({ request, onAccept, onDecline }: {
  request: { name: string; title: string; emoji: string; mutual: number };
  onAccept: () => void; onDecline: () => void;
}) {
  return (
    <div className="absolute top-12 right-2 z-[65] w-64 border-2 shadow-lg" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
      <div className="px-2 py-1 text-xs" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
        🤝 Nouvelle invitation
      </div>
      <div className="p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">{request.emoji}</div>
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{request.name}</div>
            <div className="text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{request.title}</div>
            {request.mutual > 0 && (
              <div className="text-[0.65rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{request.mutual} relation(s) en commun</div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onAccept} className="flex-1 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>Accepter</button>
          <button onClick={onDecline} className="flex-1 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Ignorer</button>
        </div>
      </div>
    </div>
  );
}

// ── Animated stat counter ─────────────────────────────────────────────────────

function StatCounter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  const target = value;

  useEffect(() => {
    let frame = 0;
    const steps = 28;
    const interval = setInterval(() => {
      frame++;
      setDisplayed(Math.floor((target * frame) / steps));
      if (frame >= steps) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="text-center px-3 py-2 border-2" style={{ ...sunkenStyle() }}>
      <div className="text-lg font-bold" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>{displayed.toLocaleString("fr-FR")}{suffix}</div>
      <div className="text-[0.65rem]" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{label}</div>
    </div>
  );
}

// ── Search bar with dropdown ──────────────────────────────────────────────────

function SearchBar({ playBip, showToast }: { playBip: () => void; showToast: (m: string) => void }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    if (!query.trim()) return;
    playBip();
    setSearching(true);
    setResult(null);
    setTimeout(() => {
      setSearching(false);
      const msg = pick(SEARCH_RESULTS)(query.trim());
      setResult(msg);
      showToast(msg);
    }, 900 + Math.random() * 600);
  }

  return (
    <div className="relative flex items-center gap-1 px-2 py-0.5 border-2 flex-1 min-w-0" style={{ borderTopColor: "rgba(0,0,0,0.5)", borderLeftColor: "rgba(0,0,0,0.5)", borderBottomColor: "rgba(255,255,255,0.2)", borderRightColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.15)" }}>
      <span className="text-xs opacity-70">🔍</span>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setResult(null); }}
        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        placeholder={searching ? "Recherche en cours..." : "opportunités..."}
        className="bg-transparent border-none outline-none text-sm flex-1 min-w-0"
        style={{ fontFamily: "var(--t-font-display)", color: "var(--t-titlebar-text)", opacity: 0.85 }}
      />
      {query && !searching && (
        <button onClick={handleSearch} className="text-[0.65rem] px-1 border opacity-70 hover:opacity-100" style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--t-titlebar-text)", backgroundColor: "transparent" }}>OK</button>
      )}
      {searching && <span className="text-xs animate-[blink_0.5s_step-end_infinite]" style={{ color: "var(--t-titlebar-text)" }}>⏳</span>}
      {result && !searching && (
        <button onClick={() => { setResult(null); setQuery(""); }} className="text-xs opacity-50" style={{ color: "var(--t-titlebar-text)", backgroundColor: "transparent", border: "none" }}>✕</button>
      )}
    </div>
  );
}

// ── Add Experience Dialog ─────────────────────────────────────────────────────

const ABSURD_TITLES = [
  "Chief Disruption Officer", "Head of Synergies", "VP of Post-its",
  "Directeur de la Transformation Transformatrice", "Ninja du Digital",
  "Guru de l'Agilité Bienveillante", "Manager de l'Innovation Innovante",
];
const ABSURD_COMPANIES = [
  "StartupXYZ (pivot en cours)", "Société Anonyme de Consulting",
  "Cabinet Blabla & Associés", "L'Usine à Buzzwords SAS",
  "Disruption Corp", "AgileWave Solutions",
];

function AddExperienceDialog({ onClose, onSubmit, playClick, playPop }: {
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

// ── Add Recommendation Dialog ─────────────────────────────────────────────────

const RELATIONSHIP_SUGGESTIONS = [
  "Collègue disruptif(ve)", "Manager bienveillant(e)", "Subordonné(e) agile",
  "Partenaire de réunions debout", "Mentor du pivot permanent",
];

function AddRecommendationDialog({ currentUserId, onClose, onSubmit, playClick, playPop }: {
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
          <textarea value={content} onChange={(e) => setContent(e.target.value.slice(0, 600))} rows={4} placeholder="J'ai eu le privilège de travailler avec cette personne exceptionnelle. Sa capacité à synergiser les disruptances tout en maintenant une agilité bienveillante force le respect." className="w-full border-none outline-none px-2 py-1 text-sm resize-none" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }} />
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

// ── Main Component ─────────────────────────────────────────────────────────────

export function LinkedGunthApp(_: AppProps) {
  const { user } = useAuth();
  const { playClick, playPop, playDelete, playVictory, playBip } = useSoundContext();
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [followersCount, setFollowersCount] = useState(0);
  const [postViewCounts, setPostViewCounts] = useState<Record<number, number>>({});
  const [notifications, setNotifications] = useState<{ id: number; text: string; icon: string; read: boolean }[]>([]);
  const [showPremium, setShowPremium] = useState(false);
  const [showInMail, setShowInMail] = useState(false);
  const [inMailRead, setInMailRead] = useState(false);
  const [inMailIndex, setInMailIndex] = useState(0);
  const [inMailReplied, setInMailReplied] = useState(false);
  const [notifBounce, setNotifBounce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openToWork, setOpenToWork] = useState(false);
  const [endorsedSkills, setEndorsedSkills] = useState<Record<number, number>>({});
  const [showProfilEdit, setShowProfilEdit] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // profil étendu
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [profileViews, setProfileViews] = useState<ProfileView[]>([]);
  const [profileViewCount, setProfileViewCount] = useState(0);
  const [endorsementCounts, setEndorsementCounts] = useState<Record<string, number>>({});
  const [myEndorsements, setMyEndorsements] = useState<string[]>([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddRecommendation, setShowAddRecommendation] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [connectionRequest, setConnectionRequest] = useState<(typeof CONNECTION_REQUESTS)[number] | null>(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [sandrineSeen, setSandrineSeen] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewCountRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unread = notifications.filter((n) => !n.read).length;

  const showToast = useCallback((msg: string) => { setToast(msg); }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/linked-gunth/posts?limit=30");
      if (!res.ok) return;
      const data = (await res.json()) as { posts: Post[] };
      setPosts(data.posts);
    } catch { /* ignore */ } finally {
      setLoading(false);
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
      const res = await fetch(`/api/linked-gunth/follows?userId=${user.id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { followers: number };
      setFollowersCount(data.followers);
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

  // Fetch avatar from DB (not in session)
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.profile?.avatarDataUrl) setAvatarDataUrl(data.profile.avatarDataUrl); })
      .catch(() => {});
  }, [user]);

  // Initial fetches
  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { fetchFollows(); }, [fetchFollows]);
  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  // Polling posts + notifs
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      await fetchPosts();
      await fetchNotifications();
      // Notif fantaisiste aléatoire (ambiance LinkedIn)
      if (Math.random() > 0.6) {
        const t = pick(NOTIF_TEMPLATES);
        setNotifBounce(true);
        setNotifications((prev) => [{ id: Date.now(), text: t.text, icon: t.icon, read: false }, ...prev.slice(0, 19)]);
        setTimeout(() => setNotifBounce(false), 600);
      }
    }, 30000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchPosts, fetchNotifications]);

  // Live view counter — increments random posts slowly
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

  // Random connection request popup (once after 15-30s)
  useEffect(() => {
    const delay = 15000 + Math.random() * 15000;
    connectionTimerRef.current = setTimeout(() => {
      setConnectionRequest(pick(CONNECTION_REQUESTS));
    }, delay);
    return () => { if (connectionTimerRef.current) clearTimeout(connectionTimerRef.current); };
  }, []);

  // Typing indicator when messages tab opened
  useEffect(() => {
    if (tab === "messages" && !sandrineSeen) {
      setSandrineSeen(true);
      const t1 = setTimeout(() => setTypingIndicator(true), 1200);
      const t2 = setTimeout(() => setTypingIndicator(false), 5500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    return undefined;
  }, [tab, sandrineSeen]);

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
    await fetchFollows();
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

  function handleDeclineConnection() {
    playDelete();
    showToast("Invitation ignorée. Ils ne le sauront jamais.");
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


  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-bg)", minHeight: 0 }}>
      {/* ── Header ── */}
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

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-2" style={{ backgroundColor: "var(--t-bg-dark)", minHeight: 0 }}>
        <div className="max-w-xl mx-auto">

          {/* FEED */}
          {tab === "feed" && (
            <>
              {user && !showCompose && (
                <button onClick={() => { playClick(); setShowCompose(true); }} className="w-full mb-2 py-2 text-sm border-2" style={{ fontFamily: "var(--t-font-display)", ...raisedStyle(true) }}>
                  ✏️ Publier un post
                </button>
              )}

              {showCompose && user && (
                <div className="mb-2 p-2 border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
                  <div className="text-sm mb-2" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)" }}>✏️ Partagez quelque chose d&apos;inspirant (ou pas)</div>
                  <div className="mb-2 border-2" style={{ ...sunkenStyle() }}>
                    <textarea
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder={"J'ai tout quitté.\n.\n.\n.\nPour créer quelque chose."}
                      rows={5} maxLength={1000}
                      className="w-full resize-y border-none outline-none p-2 text-sm"
                      style={{ fontFamily: "var(--t-font-body)", backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end items-center flex-wrap">
                    <span className="flex-1 text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
                      {newPostText.length}/1000 · lignes vides = +400% engagement
                    </span>
                    <button
                      onClick={handleAiSuggest}
                      disabled={aiSuggesting}
                      className="px-2 py-0.5 text-xs border-2 disabled:opacity-50"
                      style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(), transition: "all 0.15s" }}
                    >
                      {aiSuggesting ? "⏳ IA inspire..." : "✨ Idée IA"}
                    </button>
                    <button onClick={() => { playClick(); setShowCompose(false); setNewPostText(""); }} className="px-2 py-0.5 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Annuler</button>
                    <button onClick={handlePost} disabled={posting || !newPostText.trim()} className="px-2 py-0.5 text-sm border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
                      {posting ? "Envoi..." : "🚀 Publier"}
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
                  <span className="animate-[blink_1s_step-end_infinite]">⏳</span> Chargement du contenu inspirant...
                </div>
              ) : (
                <>
                  {posts.map((p) => (
                    <PostCard
                      key={p.id} post={p} user={user}
                      expandedPosts={expandedPosts} setExpandedPosts={setExpandedPosts}
                      handleReact={handleReact}
                      onShare={() => showToast(pick(SHARE_TOASTS))}
                      followedUsers={followedUsers} onFollowUser={handleFollowUser}
                      playClick={playClick} playPop={playPop}
                      viewCount={postViewCounts[p.id] ?? Math.floor(1 + p.id * 7 + totalReactions(p.reactions) * 3)}
                    />
                  ))}
                  <div className="text-center py-3 text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
                    <span className="animate-[blink_1.5s_step-end_infinite]">●</span> Vous avez tout vu. Revenez demain.
                  </div>
                </>
              )}
            </>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div className="overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
              <div className="px-2 py-1 text-sm" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
                🔔 Notifications ({unread} non lues)
              </div>
              <div className="flex justify-between items-center p-1" style={{ backgroundColor: "var(--t-bg)" }}>
                <span className="text-xs px-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </span>
                <button onClick={handleMarkAllRead} className="px-2 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>
                  Tout marquer lu
                </button>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkOneRead(n.id)}
                  className="flex items-start gap-2 px-2 py-2 border-b cursor-default"
                  style={{ borderColor: "var(--t-border-dark)", backgroundColor: n.read ? "var(--t-bg)" : "var(--t-card-hover)" }}
                >
                  <span className="text-xl shrink-0">{n.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>{n.text}</div>
                    {!n.read && <div className="text-xs" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>Nouveau</div>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteNotif(n.id); }} className="text-xs px-1.5 py-0.5 border-2 shrink-0 opacity-50 hover:opacity-100" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>✕</button>
                  {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: "var(--t-accent)" }} />}
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-8 text-center" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
                  <div className="text-2xl mb-1">🎉</div>
                  <div className="text-sm">Aucune notification.</div>
                  <div className="text-xs mt-1" style={{ color: "var(--t-text-subtle)" }}>Profitez-en, ça ne durera pas.</div>
                </div>
              )}
              <div className="px-2 py-1.5 text-center text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", backgroundColor: "var(--t-bg-dark)" }}>
                💡 Astuce Premium : recevez encore plus de notifications inutiles pour 29,99€/mois
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === "messages" && (
            <div className="overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
              <div className="px-2 py-1 text-sm" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
                ✉️ Messages {!inMailRead && "(1 non lu)"}
              </div>

              {/* Sandrine */}
              <div
                onClick={() => { playClick(); setShowInMail(true); setInMailRead(true); setInMailIndex(Math.floor(Math.random() * INMAIL_TEMPLATES.length)); }}
                className="flex items-start gap-2 p-2 border-b cursor-default"
                style={{ borderColor: "var(--t-border-dark)", backgroundColor: inMailRead ? "var(--t-bg)" : "var(--t-card-hover)" }}
              >
                <Avatar emoji="💼" size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>Sandrine R. · Talent Acquisition</span>
                    <span className="text-xs shrink-0" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>il y a 2 min</span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>InMail Premium</div>
                  {typingIndicator ? (
                    <div className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-body)" }}>
                      <span className="animate-[blink_0.6s_step-end_infinite]">●●●</span>
                      <span className="text-xs italic">Sandrine est en train d&apos;écrire...</span>
                    </div>
                  ) : (
                    <div className="text-sm mt-0.5" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>
                      Bonjour [PRÉNOM], votre profil a retenu mon attention...
                    </div>
                  )}
                </div>
                {!inMailRead && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: "var(--t-accent)" }} />}
              </div>

              {/* Fake other messages */}
              {[
                { emoji: "🤖", name: "LinkedGunth Bot", sub: "Notification automatique", preview: "Votre profil a été vu 1 fois cette semaine (c'était vous)", time: "il y a 3j", read: true },
                { emoji: "📊", name: "Statistiques du réseau", sub: "Rapport hebdo", preview: "Vos posts ont généré 0 engagement cette semaine.", time: "il y a 5j", read: true },
              ].map((m, i) => (
                <div key={i}
                  onClick={() => { playClick(); showToast("Ce message est verrouillé. Passez à Premium."); }}
                  className="flex items-start gap-2 p-2 border-b cursor-default"
                  style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)", opacity: 0.7 }}
                >
                  <Avatar emoji={m.emoji} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{m.name}</span>
                      <span className="text-xs shrink-0" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{m.time}</span>
                    </div>
                    <div className="text-xs" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{m.sub}</div>
                    <div className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-body)" }}>
                      <span className="text-xs">🔒</span> <span className="blur-[3px] select-none">{m.preview}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="py-6 text-center" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
                <div className="text-2xl mb-1.5 animate-[blink_2s_step-end_infinite]">📭</div>
                <div className="text-sm">C&apos;est normal. Vous avez {followersCount} relations.</div>
                <div className="mt-1 text-xs" style={{ color: "var(--t-text-subtle)" }}>2 messages débloquables avec Premium</div>
              </div>
            </div>
          )}

          {/* PROFIL */}
          {tab === "profil" && (
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
                  <div className="min-w-0">
                    <div className="font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{user?.name ?? "Visiteur"}</div>
                    <div className="text-sm" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
                      {profileData?.headline ?? "En recherche de nouvelles opportunités | Ouvert au monde 🌍"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>
                      {profileData?.location ?? "Paris, Île-de-France"}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>
                      {followersCount} relations ·{" "}
                      <span className="cursor-pointer underline" onClick={() => { playBip(); setShowPremium(true); }}>🔒 500+ avec Premium</span>
                    </div>
                  </div>
                  {user && (
                    <button
                      onClick={handleToggleOpenToWork}
                      className={`shrink-0 px-1.5 py-0.5 text-xs border-2 ${openToWork ? "animate-[blink_2s_step-end_infinite]" : "opacity-60"}`}
                      style={{ borderColor: openToWork ? "var(--t-accent)" : "var(--t-border-dark)", backgroundColor: openToWork ? "var(--t-accent)" : "var(--t-bg)", color: openToWork ? "var(--t-titlebar-text)" : "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
                    >
                      {openToWork ? "🟢 OTW" : "⚪ OTW"}
                    </button>
                  )}
                </div>

                <div className="flex gap-1 mt-2">
                  <button onClick={() => { playClick(); setShowProfilEdit(true); }} className="flex-1 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>✏️ Modifier</button>
                  <button onClick={() => { playClick(); setShowAddExperience(true); }} className="flex-1 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>💼 + Expérience</button>
                </div>
              </div>

              {/* Stats profil */}
              <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
                <div className="px-2 py-1 text-sm mb-2" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
                  📊 Statistiques du profil
                </div>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  <StatCounter label="Vues du profil" value={profileViewCount || 7} />
                  <StatCounter label="Apparitions" value={142} />
                  <StatCounter label="Recherches" value={0} suffix="" />
                </div>
                {/* Visiteurs */}
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
                      <div key={v.id} className="flex items-center gap-1.5 px-2 py-1 border-b last:border-0" style={{ borderColor: "var(--t-border-dark)" }}>
                        <span className="text-base">{v.botEmoji ?? "👤"}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-display)" }}>
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
                    <button onClick={() => { playClick(); setShowAddExperience(true); }} className="px-1.5 py-0.5 text-xs border-2 shrink-0" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>+ Ajouter</button>
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
                        <button onClick={() => handleDeleteExperience(exp.id)} className="shrink-0 px-1 text-xs border-2 opacity-40 hover:opacity-100" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>✕</button>
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
                            handleEndorseUserSkill(user.id, skill.name);
                          } else {
                            handleEndorseSkill(i);
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

              {/* Recommandations */}
              <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="px-2 py-1 text-sm flex-1 mr-1" style={{ ...TITLEBAR_GRADIENT, fontFamily: "var(--t-font-display)" }}>
                    🏆 Recommandations ({recommendations.length})
                  </div>
                  {user && (
                    <button onClick={() => { playClick(); setShowAddRecommendation(true); }} className="px-1.5 py-0.5 text-xs border-2 shrink-0" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>+ Rédiger</button>
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
                            <button onClick={() => handleDeleteRecommendation(rec.id)} className="px-1 text-xs border-2 opacity-40 hover:opacity-100" style={{ ...raisedStyle() }}>✕</button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs leading-snug" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-body)" }}>&ldquo;{rec.content}&rdquo;</div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t px-3 py-2" style={{ borderColor: "var(--t-border-dark)" }}>
                <button onClick={() => { playBip(); setShowPremium(true); }} className="w-full text-center px-2 py-1 text-xs border-2" style={{ ...sunkenStyle(), color: "var(--t-app-text-muted)", fontFamily: "var(--t-font-display)" }}>
                  🏅 Badge &quot;Top Voice&quot; disponible avec Premium (29,99€/mois)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="shrink-0 flex justify-between items-center px-2 py-0.5 text-xs border-t-2" style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)", fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>
        <span>🔗 linkedGunth.exe · {posts.length} posts</span>
        <span className="animate-[blink_2s_step-end_infinite]">● {user ? `Connecté · ${followersCount} relations` : "Non connecté"} · 0 opportunités</span>
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── Confetti ── */}
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* ── Profil Edit dialog ── */}
      {showProfilEdit && <ProfilEditDialog onClose={() => setShowProfilEdit(false)} playClick={playClick} playPop={playPop} />}

      {/* ── Add Experience dialog ── */}
      {showAddExperience && (
        <AddExperienceDialog
          onClose={() => { playClick(); setShowAddExperience(false); }}
          onSubmit={handleAddExperience}
          playClick={playClick}
          playPop={playPop}
        />
      )}

      {/* ── Add Recommendation dialog ── */}
      {showAddRecommendation && user && (
        <AddRecommendationDialog
          currentUserId={user.id}
          onClose={() => { playClick(); setShowAddRecommendation(false); }}
          onSubmit={handleAddRecommendation}
          playClick={playClick}
          playPop={playPop}
        />
      )}

      {/* ── Connection Request Popup ── */}
      {connectionRequest && (
        <ConnectionRequestPopup
          request={connectionRequest}
          onAccept={handleAcceptConnection}
          onDecline={handleDeclineConnection}
        />
      )}

      {/* ── InMail dialog ── */}
      {showInMail && (
        <DialogShell title="✉️ InMail de Sandrine R." onClose={() => { playClick(); setShowInMail(false); setInMailReplied(false); }} width="440px">
          {inMailReplied ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-sm mb-1" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>Réponse envoyée avec enthousiasme !</div>
              <div className="p-2 mb-2 border-2 text-left" style={{ ...sunkenStyle() }}>
                <pre className="text-xs whitespace-pre-wrap m-0" style={{ fontFamily: "var(--t-font-body)", color: "var(--t-app-text)", lineHeight: 1.6 }}>{pick(ENTHUSIASTIC_REPLIES)}</pre>
              </div>
              <div className="text-xs mb-3" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>Sandrine ne répondra probablement jamais.</div>
              <button onClick={() => { playClick(); setShowInMail(false); setInMailReplied(false); }} className="px-3 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Fermer</button>
            </div>
          ) : (
            <>
              <div className="p-2 mb-2 border-2" style={{ ...sunkenStyle() }}>
                <pre className="text-sm whitespace-pre-wrap m-0" style={{ fontFamily: "var(--t-font-body)", color: "var(--t-app-text)", lineHeight: 1.65 }}>{INMAIL_TEMPLATES[inMailIndex]}</pre>
              </div>
              <div className="flex gap-1.5 justify-end">
                <button onClick={() => { playVictory(); setInMailReplied(true); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>Répondre avec enthousiasme</button>
                <button onClick={() => { playDelete(); setShowInMail(false); }} className="px-2 py-1 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Ignorer</button>
              </div>
            </>
          )}
        </DialogShell>
      )}

      {/* ── Premium dialog ── */}
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
