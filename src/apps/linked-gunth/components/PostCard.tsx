"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Post, Comment, Reaction, ViewedProfile } from "../types";
import { raisedStyle, sunkenStyle, timeAgo, totalReactions, pick } from "../helpers";
import { COMMENT_RESPONSES } from "../constants";
import { Avatar } from "./Avatar";

// ── CommentItem ────────────────────────────────────────────────────────────────

function CommentItem({ comment, user, onLike, playClick, playPop, replyingTo, setReplyingTo, onSubmitReply, replies, onOpenProfile }: {
  comment: Comment;
  user: { id: string } | null;
  onLike: (id: number) => void;
  playClick: () => void;
  playPop: () => void;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  onSubmitReply: (parentId: number, text: string) => Promise<void>;
  replies: Comment[];
  onOpenProfile: (p: ViewedProfile) => void;
}) {
  const isBot = !comment.authorId;
  const name = isBot ? comment.botName : (comment.authorName ?? "Anonyme");
  const avatar = isBot ? comment.botAvatar : null;
  const avatarSrc = !isBot ? comment.authorAvatar : null;

  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  function handleOpenProfile() {
    playClick();
    if (isBot) {
      onOpenProfile({ kind: "bot", name: name ?? "", title: "", emoji: avatar ?? "👤" });
    } else if (comment.authorId) {
      onOpenProfile({ kind: "user", userId: comment.authorId, name: name ?? "" });
    }
  }

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
        <button className="border-none bg-transparent p-0 cursor-pointer shrink-0" onClick={handleOpenProfile}>
          <Avatar src={avatarSrc} emoji={avatar ?? "👤"} size={28} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button className="text-xs font-bold border-none bg-transparent p-0 cursor-pointer" style={{ color: "var(--t-app-text)", fontFamily: "var(--t-font-display)" }} onClick={handleOpenProfile}>{name}</button>
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

// ── InlineComments ─────────────────────────────────────────────────────────────

function InlineComments({ postId, user, playClick, playPop, onOpenProfile }: {
  postId: number;
  user: { id: string; name?: string | null } | null;
  playClick: () => void;
  playPop: () => void;
  onOpenProfile: (p: ViewedProfile) => void;
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
      {user && (
        <div className="px-2 pt-1.5 pb-1 flex flex-wrap gap-1">
          {COMMENT_RESPONSES.slice(0, 3).map((r) => (
            <button key={r} onClick={() => handleQuickComment(r)} className="px-1.5 py-0.5 text-[0.62rem] border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>
              {r.length > 24 ? r.slice(0, 24) + "…" : r}
            </button>
          ))}
        </div>
      )}

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
              onOpenProfile={onOpenProfile}
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

export function PostCard({ post, user, expandedPosts, setExpandedPosts, handleReact, onShare, followedUsers, onFollowUser, onOpenProfile, playClick, playPop, viewCount }: {
  post: Post; user: { id: string } | null;
  expandedPosts: Set<number>; setExpandedPosts: React.Dispatch<React.SetStateAction<Set<number>>>;
  handleReact: (postId: number, reaction: Reaction) => void;
  onShare: () => void;
  followedUsers: Set<string>; onFollowUser: (authorId: string, authorName: string) => void;
  onOpenProfile: (p: ViewedProfile) => void;
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

  function handleOpenAuthorProfile() {
    playClick();
    if (isBot) {
      onOpenProfile({ kind: "bot", name: displayName ?? "", title: post.botTitle ?? "", emoji: post.botAvatar ?? "👤" });
    } else if (post.authorId) {
      onOpenProfile({ kind: "user", userId: post.authorId, name: displayName ?? "" });
    }
  }

  return (
    <div className="mb-1.5 overflow-hidden border-2" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
      <div className="flex items-start gap-2 p-2">
        <button className="border-none bg-transparent p-0 cursor-pointer" onClick={handleOpenAuthorProfile}>
          <Avatar src={post.authorAvatar} emoji={displayAvatar ?? "👤"} size={40} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button className="font-bold border-none bg-transparent p-0 cursor-pointer text-left" style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)" }} onClick={handleOpenAuthorProfile}>{displayName}</button>
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

      {showComments && (
        <InlineComments postId={post.id} user={user} playClick={playClick} playPop={playPop} onOpenProfile={onOpenProfile} />
      )}
    </div>
  );
}
