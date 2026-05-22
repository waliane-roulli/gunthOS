import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, linkedGunthProfiles, linkedGunthExperiences, linkedGunthEndorsements, linkedGunthFollows } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { badRequest } from "@/lib/api-utils";

// GET /api/linked-gunth/public-profile?userId=X
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId requis");

  const userRow = db().select({ id: user.id, name: user.name, username: user.username, avatarDataUrl: user.avatarDataUrl }).from(user).where(eq(user.id, userId)).get();
  if (!userRow) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const profile = db().select().from(linkedGunthProfiles).where(eq(linkedGunthProfiles.userId, userId)).get();
  const experiences = db().select().from(linkedGunthExperiences).where(eq(linkedGunthExperiences.userId, userId)).all();
  const endorsements = db().select({ skill: linkedGunthEndorsements.skillName }).from(linkedGunthEndorsements).where(eq(linkedGunthEndorsements.fromUserId, userId)).all();
  const followersRow = db().select({ c: count() }).from(linkedGunthFollows).where(eq(linkedGunthFollows.followedId, userId)).get();

  return NextResponse.json({
    user: userRow,
    profile: profile ?? { userId, openToWork: false, headline: null, location: null },
    experiences,
    endorsedSkills: endorsements.map((e) => e.skill),
    followersCount: followersRow?.c ?? 0,
  });
}
