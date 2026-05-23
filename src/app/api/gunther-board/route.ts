export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guntherBoardTickets, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { headers } from "next/headers";
import { unauthorized, badRequest } from "@/lib/api-utils";

export async function GET() {
  const assignee = alias(user, "assignee");
  const creator = alias(user, "creator");

  const tickets = db()
    .select({
      id: guntherBoardTickets.id,
      title: guntherBoardTickets.title,
      description: guntherBoardTickets.description,
      status: guntherBoardTickets.status,
      priority: guntherBoardTickets.priority,
      label: guntherBoardTickets.label,
      scope: guntherBoardTickets.scope,
      assigneeId: guntherBoardTickets.assigneeId,
      createdById: guntherBoardTickets.createdById,
      createdAt: guntherBoardTickets.createdAt,
      updatedAt: guntherBoardTickets.updatedAt,
      assigneeName: assignee.name,
      assigneeUsername: assignee.username,
      assigneeAvatar: assignee.avatarDataUrl,
      createdByName: creator.name,
      createdByUsername: creator.username,
      createdByAvatar: creator.avatarDataUrl,
    })
    .from(guntherBoardTickets)
    .leftJoin(assignee, eq(guntherBoardTickets.assigneeId, assignee.id))
    .leftJoin(creator, eq(guntherBoardTickets.createdById, creator.id))
    .orderBy(desc(guntherBoardTickets.createdAt))
    .all();

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return unauthorized();

  const body = await req.json();
  const { title, description, priority, label, scope, assigneeId } = body;

  if (!title?.trim()) return badRequest("Le titre est requis");

  const [ticket] = db()
    .insert(guntherBoardTickets)
    .values({
      title: title.trim(),
      description: description?.trim() || null,
      status: "todo",
      priority: priority ?? "medium",
      label: label ?? null,
      scope: scope ?? null,
      assigneeId: assigneeId ?? null,
      createdById: session.user.id,
    })
    .returning()
    .all();

  return NextResponse.json(ticket, { status: 201 });
}
