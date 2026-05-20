import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// GET /api/profiles/list — public list of all users (no email/password)
export async function GET() {
  const users = db()
    .select({
      id: user.id,
      username: user.username,
      displayUsername: user.displayUsername,
      name: user.name,
      statusMessage: user.statusMessage,
      avatarDataUrl: user.avatarDataUrl,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .all();

  return NextResponse.json({ users });
}
