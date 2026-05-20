import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const row = db().select().from(visitors).where(eq(visitors.id, 1)).get();

    if (!row) {
      db().insert(visitors).values({ id: 1, count: 1 }).run();
      return NextResponse.json({ count: 1 });
    }

    const newCount = row.count + 1;
    db().update(visitors).set({ count: newCount }).where(eq(visitors.id, 1)).run();
    return NextResponse.json({ count: newCount });
  } catch (err) {
    console.error("visitors POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const row = db().select().from(visitors).where(eq(visitors.id, 1)).get();
    return NextResponse.json({ count: row?.count ?? 0 });
  } catch (err) {
    console.error("visitors GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
