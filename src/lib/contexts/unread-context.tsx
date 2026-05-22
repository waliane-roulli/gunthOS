"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useSSE } from "@/lib/hooks/use-sse";
import { useNotify } from "@/lib/contexts/notification-context";
import { useOpenApp } from "@/lib/hooks/use-open-app";
import type { SSEEvent } from "@/lib/sse-bus";

export type ChatEffect = "confetti" | "bsod" | "rain" | "shake" | "matrix" | "heart";

export interface ChatAPI {
  pushMessage: (msg: {
    id: number; fromUserId: string; toUserId: string; content: string; createdAt: string | Date;
  }) => void;
  triggerNudge: (fromName: string) => void;
  triggerTyping: () => void;
  triggerEffect: (effect: ChatEffect, fromName: string) => void;
}

interface MessengerContextValue {
  totalUnread: number;
  unreadCounts: Record<string, number>;
  markRead: (contactId: string) => void;
  registerChat: (contactId: string, api: ChatAPI) => void;
  unregisterChat: (contactId: string) => void;
  // set by MsnApp to open a chat window from SSE nudge
  onNudgeOpen: React.RefObject<((contactId: string) => void) | null>;
  // set by MsnApp to handle real-time status updates
  onStatusUpdate: React.RefObject<((userId: string, status: "online" | "away" | "busy" | "offline") => void) | null>;
}

const MessengerContext = createContext<MessengerContextValue>({
  totalUnread: 0,
  unreadCounts: {},
  markRead: () => {},
  registerChat: () => {},
  unregisterChat: () => {},
  onNudgeOpen: { current: null },
  onStatusUpdate: { current: null },
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const notify = useNotify();
  const { openApp } = useOpenApp();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // contactId → live ChatAPI of open window
  const chatApis = useRef<Record<string, ChatAPI>>({});
  // contactId → pending nudge fromName, consumed when the chat window mounts
  const pendingNudges = useRef<Record<string, string>>({});
  // set by MsnApp: called when SSE nudge arrives and chat is closed
  const onNudgeOpen = useRef<((contactId: string) => void) | null>(null);
  // set by MsnApp: called on real-time status changes
  const onStatusUpdate = useRef<((userId: string, status: "online" | "away" | "busy" | "offline") => void) | null>(null);

  const markRead = useCallback((contactId: string) => {
    setUnreadCounts(prev => {
      if (!prev[contactId]) return prev;
      return { ...prev, [contactId]: 0 };
    });
  }, []);

  const registerChat = useCallback((contactId: string, api: ChatAPI) => {
    chatApis.current[contactId] = api;
    // Clear badge when chat opens
    setUnreadCounts(prev => prev[contactId] ? { ...prev, [contactId]: 0 } : prev);
    // Fire any nudge that arrived before the window was mounted
    const pending = pendingNudges.current[contactId];
    if (pending) {
      delete pendingNudges.current[contactId];
      api.triggerNudge(pending);
    }
  }, []);

  const unregisterChat = useCallback((contactId: string) => {
    delete chatApis.current[contactId];
  }, []);

  // Sync totalUnread from unreadCounts
  useEffect(() => {
    setTotalUnread(Object.values(unreadCounts).reduce((a, b) => a + b, 0));
  }, [unreadCounts]);

  // Initial fetch of unread counts from last 24h
  useEffect(() => {
    if (!user) return;
    const since = Date.now() - 24 * 60 * 60 * 1000;
    fetch(`/api/messages/unread?since=${since}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.counts) return;
        setUnreadCounts(prev => {
          const next = { ...prev };
          for (const [id, count] of Object.entries(data.counts as Record<string, number>)) {
            // Don't overwrite if chat is already open
            if (!chatApis.current[id]) next[id] = count;
          }
          return next;
        });
      });
  }, [user]);

  // Global SSE handler — always active when user is logged in
  const handleSSE = useCallback((event: SSEEvent) => {
    if (event.type === "message") {
      const fromId = event.fromUserId;
      const api = chatApis.current[fromId];
      if (api) {
        api.pushMessage({
          id: event.messageId,
          fromUserId: fromId,
          toUserId: event.toUserId,
          content: event.content,
          createdAt: event.createdAt,
        });
      } else {
        setUnreadCounts(prev => ({ ...prev, [fromId]: (prev[fromId] ?? 0) + 1 }));
        notify({
          type: "info",
          title: `💬 Message de ${event.fromName}`,
          message: event.content.length > 60 ? event.content.slice(0, 60) + "…" : event.content,
          duration: 5000,
          onClick: () => openApp("msn"),
        });
      }
    }

    if (event.type === "nudge") {
      const fromId = event.fromUserId;
      const api = chatApis.current[fromId];
      if (api) {
        api.triggerNudge(event.fromName);
      } else {
        // Store nudge — registerChat will fire it once the window mounts
        pendingNudges.current[fromId] = event.fromName;
        onNudgeOpen.current?.(fromId);
        notify({
          type: "warning",
          title: `🫨 Nudge de ${event.fromName}`,
          duration: 4000,
          onClick: () => openApp("msn"),
        });
      }
    }

    if (event.type === "status") {
      onStatusUpdate.current?.(event.userId, event.status);
    }

    if (event.type === "typing") {
      const api = chatApis.current[event.fromUserId];
      api?.triggerTyping();
    }

    if (event.type === "effect") {
      const api = chatApis.current[event.fromUserId];
      api?.triggerEffect(event.effect, event.fromName);
    }
  }, [notify]);

  useSSE(handleSSE, !!user);

  return (
    <MessengerContext.Provider value={{ totalUnread, unreadCounts, markRead, registerChat, unregisterChat, onNudgeOpen, onStatusUpdate }}>
      {children}
    </MessengerContext.Provider>
  );
}

export function useUnread() {
  const { totalUnread } = useContext(MessengerContext);
  return { totalUnread };
}

export function useMessenger() {
  return useContext(MessengerContext);
}
