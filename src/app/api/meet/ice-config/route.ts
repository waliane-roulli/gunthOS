import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.TURN_URL;
  const username = process.env.TURN_USER;
  const credential = process.env.TURN_CREDENTIAL;

  const iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
  ];

  if (url && username && credential) {
    iceServers.push({
      urls: [`turn:${url}:3478`, `turn:${url}:3478?transport=tcp`],
      username,
      credential,
    });
  }

  return NextResponse.json({ iceServers });
}
