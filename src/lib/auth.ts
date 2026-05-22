import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import * as schema from "@/lib/db/schema";

function createAuth() {
  const { db } = require("@/lib/db") as typeof import("@/lib/db");
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db(), {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    plugins: [
      username(),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    advanced: {
      cookiePrefix: "gunth",
    },
  });
}

let _auth: ReturnType<typeof createAuth> | null = null;

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_target, prop) {
    if (!_auth) _auth = createAuth();
    return (_auth as Record<string | symbol, unknown>)[prop];
  },
});

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
export type User = ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
