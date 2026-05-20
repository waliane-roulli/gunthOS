"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface UnreadContextValue {
  totalUnread: number;
  setTotalUnread: (n: number) => void;
}

const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  setTotalUnread: () => {},
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);
  const set = useCallback((n: number) => setTotalUnread(n), []);
  return (
    <UnreadContext.Provider value={{ totalUnread, setTotalUnread: set }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  return useContext(UnreadContext);
}
