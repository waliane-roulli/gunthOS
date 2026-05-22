"use client";

import type { Post, Reaction, ViewedProfile } from "../types";
import { raisedStyle } from "../helpers";
import { AI_POST_SUGGESTIONS, SHARE_TOASTS } from "../constants";
import { pick } from "../helpers";
import { PostCard } from "../components/PostCard";
import { sunkenStyle } from "../helpers";

interface FeedTabProps {
  user: { id: string } | null;
  posts: Post[];
  loading: boolean;
  refreshing: boolean;
  posting: boolean;
  newPostText: string;
  showCompose: boolean;
  aiSuggesting: boolean;
  expandedPosts: Set<number>;
  followedUsers: Set<string>;
  postViewCounts: Record<number, number>;
  setExpandedPosts: React.Dispatch<React.SetStateAction<Set<number>>>;
  setNewPostText: (t: string) => void;
  setShowCompose: (v: boolean) => void;
  onPost: () => void;
  onRefresh: () => void;
  onReact: (postId: number, reaction: Reaction) => void;
  onFollowUser: (id: string, name: string) => void;
  onOpenProfile: (p: ViewedProfile) => void;
  onShowToast: (msg: string) => void;
  playClick: () => void;
  playPop: () => void;
  playBip: () => void;
  playVictory: () => void;
  showConfetti: boolean;
  onAiSuggest: () => void;
  totalReactions: (r: Record<string, number>) => number;
}

export function FeedTab({
  user, posts, loading, refreshing, posting, newPostText, showCompose, aiSuggesting,
  expandedPosts, followedUsers, postViewCounts, setExpandedPosts, setNewPostText,
  setShowCompose, onPost, onRefresh, onReact, onFollowUser, onOpenProfile, onShowToast,
  playClick, playPop, playBip, onAiSuggest, totalReactions,
}: FeedTabProps) {
  return (
    <>
      {!showCompose && (
        <div className="flex gap-1 mb-2">
          {user && (
            <button onClick={() => { playClick(); setShowCompose(true); }} className="flex-1 py-2 text-sm border-2" style={{ fontFamily: "var(--t-font-display)", ...raisedStyle(true) }}>
              ✏️ Publier un post
            </button>
          )}
          <button
            onClick={() => { playBip(); onRefresh(); }}
            disabled={refreshing}
            className="px-3 py-2 text-sm border-2 disabled:opacity-50"
            style={{ fontFamily: "var(--t-font-display)", ...raisedStyle(), transition: "transform 0.15s" }}
            title="Actualiser le fil"
          >
            <span className={refreshing ? "animate-spin inline-block" : "inline-block"}>⟳</span>
          </button>
        </div>
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
              onClick={onAiSuggest}
              disabled={aiSuggesting}
              className="px-2 py-0.5 text-xs border-2 disabled:opacity-50"
              style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(), transition: "all 0.15s" }}
            >
              {aiSuggesting ? "⏳ IA inspire..." : "✨ Idée IA"}
            </button>
            <button onClick={() => { playClick(); setShowCompose(false); setNewPostText(""); }} className="px-2 py-0.5 text-sm border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Annuler</button>
            <button onClick={onPost} disabled={posting || !newPostText.trim()} className="px-2 py-0.5 text-sm border-2 disabled:opacity-50" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>
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
              handleReact={onReact}
              onShare={() => onShowToast(pick(SHARE_TOASTS))}
              followedUsers={followedUsers} onFollowUser={onFollowUser}
              onOpenProfile={onOpenProfile}
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
  );
}
