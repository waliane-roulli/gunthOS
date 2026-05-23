export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { osVersions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const releases = db()
      .select()
      .from(osVersions)
      .orderBy(desc(osVersions.releasedAt))
      .all();

    return NextResponse.json({ releases });
  } catch (err) {
    console.error("version GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
