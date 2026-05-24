import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

function createAuth() {
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
      minPasswordLength: 1,
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

// ReturnType<typeof createAuth> capture le type complet avec augmentations des plugins
// (contrairement à ReturnType<typeof betterAuth> qui est le type de base sans plugins).
type AuthInstance = ReturnType<typeof createAuth>;

let _auth: AuthInstance | null = null;

// Proxy transparent : db() n'est appelé qu'au premier accès runtime (pas à l'import).
// Évite SQLITE_BUSY lors du `next build` où plusieurs workers chargent le module en parallèle.
export const auth = new Proxy({} as AuthInstance, {
  get(_target, prop: string | symbol) {
    if (!_auth) _auth = createAuth();
    return _auth[prop as keyof AuthInstance];
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
