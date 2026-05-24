export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  user, session,
  messages, nudges,
  linkedGunthPosts, linkedGunthReactions, linkedGunthComments, linkedGunthFollows,
  guntherBoardTickets,
} from "@/lib/db/schema";
import { eq, count, gte, sql, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const sess = await getAuth().api.getSession({ headers: await headers() });
  if (!sess) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [caller] = await db().select({ role: user.role }).from(user).where(eq(user.id, sess.user.id));
  if (caller?.role !== "admin") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  // Users online (heartbeat < 2 min ago)
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
  const onlineUsers = await db()
    .select({
      id: user.id,
      username: user.username,
      onlineStatus: user.onlineStatus,
      lastHeartbeat: user.lastHeartbeat,
      role: user.role,
    })
    .from(user)
    .where(gte(user.lastHeartbeat, twoMinAgo));

  // Active sessions count (not expired)
  const sessionsResult = await db()
    .select({ activeSessions: count() })
    .from(session)
    .where(gte(session.expiresAt, new Date()));
  const activeSessions = sessionsResult[0]?.activeSessions ?? 0;

  // Global counts
  const [usersR, messagesR, nudgesR, postsR, reactionsR, commentsR, followsR, ticketsR] = await Promise.all([
    db().select({ v: count() }).from(user),
    db().select({ v: count() }).from(messages),
    db().select({ v: count() }).from(nudges),
    db().select({ v: count() }).from(linkedGunthPosts),
    db().select({ v: count() }).from(linkedGunthReactions),
    db().select({ v: count() }).from(linkedGunthComments),
    db().select({ v: count() }).from(linkedGunthFollows),
    db().select({ v: count() }).from(guntherBoardTickets),
  ]);

  const totalUsers = usersR[0]?.v ?? 0;
  const totalMessages = messagesR[0]?.v ?? 0;
  const totalNudges = nudgesR[0]?.v ?? 0;
  const totalPosts = postsR[0]?.v ?? 0;
  const totalReactions = reactionsR[0]?.v ?? 0;
  const totalComments = commentsR[0]?.v ?? 0;
  const totalFollows = followsR[0]?.v ?? 0;
  const totalTickets = ticketsR[0]?.v ?? 0;

  // Top MSN senders
  const topMessagers = await db()
    .select({
      userId: messages.fromUserId,
      username: user.username,
      msgCount: count(),
    })
    .from(messages)
    .leftJoin(user, eq(messages.fromUserId, user.id))
    .groupBy(messages.fromUserId)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  // Top LinkedGunth posters (real users only)
  const topPosters = await db()
    .select({
      userId: linkedGunthPosts.authorId,
      username: user.username,
      postCount: count(),
    })
    .from(linkedGunthPosts)
    .leftJoin(user, eq(linkedGunthPosts.authorId, user.id))
    .where(isNotNull(linkedGunthPosts.authorId))
    .groupBy(linkedGunthPosts.authorId)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  return NextResponse.json({
    onlineUsers,
    activeSessions,
    counts: {
      totalUsers,
      totalMessages,
      totalNudges,
      totalPosts,
      totalReactions,
      totalComments,
      totalFollows,
      totalTickets,
    },
    topMessagers,
    topPosters,
  });
}
