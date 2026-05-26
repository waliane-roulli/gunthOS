"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "../types";

export interface UseChatReturn {
  chatMessages: ChatMessage[];
  unreadCount: number;
  loadHistory: (roomId: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  sendChat: (roomId: string, currentUserId: string, currentDisplayName: string, text: string) => Promise<void>;
  markRead: () => void;
  markUnread: () => void;
}

export function useChat(): UseChatReturn {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isReadRef = useRef(true);

  const loadHistory = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/meet/rooms/${roomId}/messages`);
      if (!res.ok) return;
      const { messages } = await res.json() as { messages: Array<{ id: string; userId: string; displayName: string; content: string; createdAt: number }> };
      setChatMessages(messages.map((m) => ({
        id: m.id,
        from: m.userId,
        displayName: m.displayName,
        text: m.content,
        ts: m.createdAt,
      })));
    } catch {
      // not critical
    }
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
    if (!isReadRef.current) {
      setUnreadCount((n) => n + 1);
    }
  }, []);

  const sendChat = useCallback(async (
    roomId: string,
    currentUserId: string,
    currentDisplayName: string,
    text: string,
  ) => {
    const optimistic: ChatMessage = {
      from: currentUserId,
      displayName: currentDisplayName,
      text,
      ts: Date.now(),
    };
    setChatMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`/api/meet/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
    } catch {
      // shown optimistically, fail silently
    }
  }, []);

  const markRead = useCallback(() => {
    isReadRef.current = true;
    setUnreadCount(0);
  }, []);

  const markUnread = useCallback(() => {
    isReadRef.current = false;
  }, []);

  return {
    chatMessages,
    unreadCount,
    loadHistory,
    addMessage,
    sendChat,
    markRead,
    markUnread,
  };
}
