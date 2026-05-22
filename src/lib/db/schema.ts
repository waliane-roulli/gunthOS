import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const visitors = sqliteTable("visitors", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull().default(0),
});

// ── better-auth tables ────────────────────────────────────────────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  // Profile fields
  bio: text("bio"),
  statusMessage: text("status_message"),
  avatarDataUrl: text("avatar_data_url"),
  favoriteApp: text("favorite_app"),
  gunthosRank: text("gunthos_rank"),
  onlineStatus: text("online_status", { enum: ["online", "away", "busy", "offline"] }).default("online"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Messages MSN style
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromUserId: text("from_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Settings persistées par user
export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  settings: text("settings").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// LinkedGunth posts (vrais users + bots)
export const linkedGunthPosts = sqliteTable("linked_gunth_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  // null = bot post
  authorId: text("author_id").references(() => user.id, { onDelete: "cascade" }),
  // used when authorId is null (bot)
  botName: text("bot_name"),
  botTitle: text("bot_title"),
  botAvatar: text("bot_avatar"),
  content: text("content").notNull(),
  // JSON: { "Inspirant": 1234, "Bravo": 456, "Fascinant": 78 } — fake bot counts displayed alongside real user reactions
  botReactionCounts: text("bot_reaction_counts"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const linkedGunthReactions = sqliteTable("linked_gunth_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => linkedGunthPosts.id, { onDelete: "cascade" }),
  // null = bot reaction
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  // used when userId is null
  botName: text("bot_name"),
  reaction: text("reaction", { enum: ["Inspirant", "Bravo", "Fascinant", "Instructif", "Drôle", "Soutien"] }).notNull(),
});

export const linkedGunthComments = sqliteTable("linked_gunth_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => linkedGunthPosts.id, { onDelete: "cascade" }),
  // null = bot comment
  authorId: text("author_id").references(() => user.id, { onDelete: "cascade" }),
  botName: text("bot_name"),
  botAvatar: text("bot_avatar"),
  content: text("content").notNull(),
  // null = top-level comment
  parentId: integer("parent_id"),
  // emoji reactions: JSON { "👍": 3, "❤️": 1, ... }
  likes: integer("likes").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const linkedGunthCommentLikes = sqliteTable("linked_gunth_comment_likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  commentId: integer("comment_id").notNull().references(() => linkedGunthComments.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const linkedGunthFollows = sqliteTable("linked_gunth_follows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  followerId: text("follower_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  followedId: text("followed_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const linkedGunthNotifications = sqliteTable("linked_gunth_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  icon: text("icon").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// profil étendu (open to work, headline, localisation)
export const linkedGunthProfiles = sqliteTable("linked_gunth_profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  openToWork: integer("open_to_work", { mode: "boolean" }).notNull().default(false),
  headline: text("headline"),
  location: text("location"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// expériences professionnelles
export const linkedGunthExperiences = sqliteTable("linked_gunth_experiences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// visiteurs du profil (mix bots + vrais users)
export const linkedGunthProfileViews = sqliteTable("linked_gunth_profile_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileUserId: text("profile_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  // null = bot visitor
  viewerUserId: text("viewer_user_id").references(() => user.id, { onDelete: "cascade" }),
  botName: text("bot_name"),
  botTitle: text("bot_title"),
  botEmoji: text("bot_emoji"),
  viewedAt: integer("viewed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// recommandations entre vrais users
export const linkedGunthRecommendations = sqliteTable("linked_gunth_recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromUserId: text("from_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  relationship: text("relationship").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex("linked_gunth_recommendations_pair_idx").on(t.fromUserId, t.toUserId),
]);

// GuntherBoard — issue tracker interne GunthOS
export const guntherBoardTickets = sqliteTable("gunther_board_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull().default("todo"),
  priority: text("priority", { enum: ["low", "medium", "high", "critical"] }).notNull().default("medium"),
  label: text("label", { enum: ["bug", "feature", "chore", "ui", "audio", "db"] }),
  scope: text("scope"),
  assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
  createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// réactions aux tickets GuntherBoard
export const guntherBoardReactions = sqliteTable("gunther_board_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: integer("ticket_id").notNull().references(() => guntherBoardTickets.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  emoji: text("emoji").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex("gunther_board_reactions_unique_idx").on(t.ticketId, t.userId, t.emoji),
]);

// validations de compétences entre vrais users
export const linkedGunthEndorsements = sqliteTable("linked_gunth_endorsements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromUserId: text("from_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  skillName: text("skill_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (t) => [
  uniqueIndex("linked_gunth_endorsements_pair_idx").on(t.fromUserId, t.toUserId, t.skillName),
]);
