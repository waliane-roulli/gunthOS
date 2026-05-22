"use client";

import { useEffect } from "react";
import { useNotify } from "@/lib/contexts/notification-context";
import type { BroadcastPayload } from "@/lib/sse-broadcaster";

export function useLiveNotifications() {
  const notify = useNotify();

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data) as BroadcastPayload;
        notify({
          type: payload.type,
          title: payload.title,
          message: payload.message,
          duration: payload.duration,
        });
      } catch {
        // malformed event, ignore
      }
    };

    return () => es.close();
  }, [notify]);
}
