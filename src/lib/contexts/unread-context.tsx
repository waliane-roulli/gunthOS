"use client";

import { createContext, useContext, useState } from "react";

interface UnreadContextValue {
  totalUnread: number;
  setTotalUnread: React.Dispatch<React.SetStateAction<number>>;
}

const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  setTotalUnread: () => {},
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const [totalUnread, setTotalUnread] = useState(0);
  return (
    <UnreadContext.Provider value={{ totalUnread, setTotalUnread }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  return useContext(UnreadContext);
}
