export const dynamic = "force-dynamic";
import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

let _handlers: ReturnType<typeof toNextJsHandler> | null = null;

function handlers() {
  if (!_handlers) _handlers = toNextJsHandler(getAuth());
  return _handlers;
}

export function GET(req: Request) { return handlers().GET(req); }
export function POST(req: Request) { return handlers().POST(req); }
