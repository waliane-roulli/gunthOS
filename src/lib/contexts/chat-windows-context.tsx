"use client";

import { createContext, useContext, useRef, useCallback, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/contexts/auth-context";

interface Contact {
  id: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  statusMessage: string | null;
  avatarDataUrl: string | null;
  onlineStatus: "online" | "away" | "busy" | "offline";
}

interface GroupMember {
  userId: string;
  name: string;
  username: string | null;
  displayUsername: string | null;
  avatarDataUrl: string | null;
  onlineStatus: string | null;
}

interface Group {
  id: number;
  name: string;
  createdById: string;
  members: GroupMember[];
}

type ChatWindowEntry =
  | { kind: "dm"; contact: Contact }
  | { kind: "group"; group: Group };

interface ChatWindowsContextValue {
  getChat: (appSlug: string) => ChatWindowEntry | null;
  registerChatSlug: (appSlug: string, entry: ChatWindowEntry) => void;
  unregisterChatSlug: (appSlug: string) => void;
  myAvatar: string | null;
}

const ChatWindowsContext = createContext<ChatWindowsContextValue>({
  getChat: () => null,
  registerChatSlug: () => {},
  unregisterChatSlug: () => {},
  myAvatar: null,
});

export function ChatWindowsProvider({ children }: { children: ReactNode }) {
  const registry = useRef<Record<string, ChatWindowEntry>>({});
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/me").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.profile?.avatarDataUrl) setMyAvatar(data.profile.avatarDataUrl);
    });
  }, [user]);

  const registerChatSlug = useCallback((appSlug: string, entry: ChatWindowEntry) => {
    registry.current[appSlug] = entry;
  }, []);

  const unregisterChatSlug = useCallback((appSlug: string) => {
    delete registry.current[appSlug];
  }, []);

  const getChat = useCallback((appSlug: string): ChatWindowEntry | null => {
    return registry.current[appSlug] ?? null;
  }, []);

  return (
    <ChatWindowsContext.Provider value={{ getChat, registerChatSlug, unregisterChatSlug, myAvatar }}>
      {children}
    </ChatWindowsContext.Provider>
  );
}

export function useChatWindows() {
  return useContext(ChatWindowsContext);
}
