import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkedGunthNotifications, notifications } from "@/lib/db/schema";

export function unauthorized() {
  return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}

export function notFound(entity = "Introuvable") {
  return NextResponse.json({ error: entity }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notify(userId: string, text: string, icon: string) {
  db().insert(linkedGunthNotifications).values({ userId, text, icon }).run();
  db().insert(notifications).values({
    userId,
    source: "linked-gunth",
    type: "info",
    title: `${icon} ${text}`,
    actionAppSlug: "linked-gunth",
  }).run();
}
