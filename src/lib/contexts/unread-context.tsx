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

export interface GroupChatAPI {
  pushMessage: (msg: {
    id: number; groupId: number; fromUserId: string; fromName: string; content: string; createdAt: string | Date;
  }) => void;
  triggerTyping: (fromName: string) => void;
}

interface MessengerContextValue {
  totalUnread: number;
  unreadCounts: Record<string, number>;
  groupUnreadCounts: Record<number, number>;
  markRead: (contactId: string) => void;
  markGroupRead: (groupId: number) => void;
  registerChat: (contactId: string, api: ChatAPI) => void;
  unregisterChat: (contactId: string) => void;
  registerGroupChat: (groupId: number, api: GroupChatAPI) => void;
  unregisterGroupChat: (groupId: number) => void;
  onNudgeOpen: React.RefObject<((contactId: string) => void) | null>;
  onStatusUpdate: React.RefObject<((userId: string, status: "online" | "away" | "busy" | "offline") => void) | null>;
}

const MessengerContext = createContext<MessengerContextValue>({
  totalUnread: 0,
  unreadCounts: {},
  groupUnreadCounts: {},
  markRead: () => {},
  markGroupRead: () => {},
  registerChat: () => {},
  unregisterChat: () => {},
  registerGroupChat: () => {},
  unregisterGroupChat: () => {},
  onNudgeOpen: { current: null },
  onStatusUpdate: { current: null },
});

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const notify = useNotify();
  const { openApp } = useOpenApp();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [groupUnreadCounts, setGroupUnreadCounts] = useState<Record<number, number>>({});

  const chatApis = useRef<Record<string, ChatAPI>>({});
  const groupChatApis = useRef<Record<number, GroupChatAPI>>({});
  const pendingNudges = useRef<Record<string, string>>({});
  const onNudgeOpen = useRef<((contactId: string) => void) | null>(null);
  const onStatusUpdate = useRef<((userId: string, status: "online" | "away" | "busy" | "offline") => void) | null>(null);

  const markRead = useCallback((contactId: string) => {
    setUnreadCounts(prev => {
      if (!prev[contactId]) return prev;
      return { ...prev, [contactId]: 0 };
    });
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
  }, []);

  const markGroupRead = useCallback((groupId: number) => {
    setGroupUnreadCounts(prev => {
      if (!prev[groupId]) return prev;
      return { ...prev, [groupId]: 0 };
    });
    fetch("/api/groups/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
  }, []);

  const registerChat = useCallback((contactId: string, api: ChatAPI) => {
    chatApis.current[contactId] = api;
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

  const registerGroupChat = useCallback((groupId: number, api: GroupChatAPI) => {
    groupChatApis.current[groupId] = api;
    markGroupRead(groupId);
  }, [markGroupRead]);

  const unregisterGroupChat = useCallback((groupId: number) => {
    delete groupChatApis.current[groupId];
  }, []);

  useEffect(() => {
    const dmTotal = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
    const groupTotal = Object.values(groupUnreadCounts).reduce((a, b) => a + b, 0);
    setTotalUnread(dmTotal + groupTotal);
  }, [unreadCounts, groupUnreadCounts]);

  // Initial fetch unread DM counts
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

    if (event.type === "group_message") {
      if (event.fromUserId === user?.id) return;
      const groupId = event.groupId;
      const api = groupChatApis.current[groupId];
      if (api) {
        api.pushMessage({
          id: event.messageId,
          groupId,
          fromUserId: event.fromUserId,
          fromName: event.fromName,
          content: event.content,
          createdAt: event.createdAt,
        });
      } else {
        setGroupUnreadCounts(prev => ({ ...prev, [groupId]: (prev[groupId] ?? 0) + 1 }));
        notify({
          type: "info",
          title: `👥 ${event.groupName}`,
          message: `${event.fromName} : ${event.content.length > 50 ? event.content.slice(0, 50) + "…" : event.content}`,
          duration: 5000,
          onClick: () => openApp("msn"),
        });
      }
    }

    if (event.type === "group_typing") {
      groupChatApis.current[event.groupId]?.triggerTyping(event.fromName);
    }
  }, [notify, user, openApp]);

  useSSE(handleSSE, !!user);

  return (
    <MessengerContext.Provider value={{
      totalUnread, unreadCounts, groupUnreadCounts,
      markRead, markGroupRead,
      registerChat, unregisterChat,
      registerGroupChat, unregisterGroupChat,
      onNudgeOpen, onStatusUpdate,
    }}>
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
