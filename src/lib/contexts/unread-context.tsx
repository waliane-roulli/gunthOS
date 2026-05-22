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
  onNudgeOpen: React.RefObject<((contactId: string) => void) | null>;
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

  const chatApis = useRef<Record<string, ChatAPI>>({});
  const pendingNudges = useRef<Record<string, string>>({});
  const onNudgeOpen = useRef<((contactId: string) => void) | null>(null);
  const onStatusUpdate = useRef<((userId: string, status: "online" | "away" | "busy" | "offline") => void) | null>(null);

  const markRead = useCallback((contactId: string) => {
    setUnreadCounts(prev => {
      if (!prev[contactId]) return prev;
      return { ...prev, [contactId]: 0 };
    });
    // Persist to DB — fire and forget
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
  }, []);

  const registerChat = useCallback((contactId: string, api: ChatAPI) => {
    chatApis.current[contactId] = api;
    // markRead handles both clearing the badge and persisting the receipt
    markRead(contactId);
    const pending = pendingNudges.current[contactId];
    if (pending) {
      delete pendingNudges.current[contactId];
      api.triggerNudge(pending);
    }
  }, [markRead]);

  const unregisterChat = useCallback((contactId: string) => {
    delete chatApis.current[contactId];
  }, []);

  useEffect(() => {
    setTotalUnread(Object.values(unreadCounts).reduce((a, b) => a + b, 0));
  }, [unreadCounts]);

  // Initial fetch — server already knows what's unread via read receipts
  useEffect(() => {
    if (!user) return;
    fetch("/api/messages/unread")
      .then(r => r.ok ? r.json() : null)
      .then((data: { counts?: Record<string, number> } | null) => {
        if (!data?.counts) return;
        setUnreadCounts(prev => {
          const next = { ...prev };
          for (const [id, count] of Object.entries(data.counts!)) {
            if (!chatApis.current[id]) next[id] = count;
          }
          return next;
        });
      });
  }, [user]);

  const handleSSE = useCallback((event: SSEEvent) => {
    if (event.type === "message") {
      if (event.fromUserId === user?.id) return;
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
      chatApis.current[event.fromUserId]?.triggerTyping();
    }

    if (event.type === "effect") {
      chatApis.current[event.fromUserId]?.triggerEffect(event.effect, event.fromName);
    }
  }, [notify, user, openApp]);

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
