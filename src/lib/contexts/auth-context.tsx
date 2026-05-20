"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import type { User } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  isPending: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isPending: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const logout = useCallback(async () => {
    await signOut();
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isPending, logout }),
    [session?.user, isPending, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
