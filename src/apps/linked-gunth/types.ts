export type Reaction = "Inspirant" | "Bravo" | "Fascinant";
export type Tab = "feed" | "notifications" | "messages" | "profil";

export interface NetworkUser {
  id: string;
  name: string;
  username: string | null;
  avatarDataUrl: string | null;
}

export type ViewedProfile =
  | { kind: "bot"; name: string; title: string; emoji: string }
  | { kind: "user"; userId: string; name: string };

export interface Experience {
  id: number;
  userId: string;
  title: string;
  company: string;
  startYear: number;
  endYear: number | null;
  isCurrent: boolean;
  description: string | null;
}

export interface Recommendation {
  id: number;
  fromUserId: string;
  fromName: string;
  fromUsername: string | null;
  content: string;
  relationship: string;
  createdAt: string;
}

export interface ProfileData {
  userId: string;
  openToWork: boolean;
  headline: string | null;
  location: string | null;
}

export interface ProfileView {
  id: number;
  botName: string | null;
  botTitle: string | null;
  botEmoji: string | null;
  viewerName: string | null;
  viewerUserId: string | null;
  viewedAt: string;
}

export interface Post {
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

export interface Comment {
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
