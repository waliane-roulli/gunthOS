import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visitors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  const row = db.select().from(visitors).where(eq(visitors.id, 1)).get();

  if (!row) {
    db.insert(visitors).values({ id: 1, count: 1 }).run();
    return NextResponse.json({ count: 1 });
  }

  const newCount = row.count + 1;
  db.update(visitors).set({ count: newCount }).where(eq(visitors.id, 1)).run();
  return NextResponse.json({ count: newCount });
}

export async function GET() {
  const row = db.select().from(visitors).where(eq(visitors.id, 1)).get();
  return NextResponse.json({ count: row?.count ?? 0 });
}
