"use client";

import { useEffect, useRef } from "react";
import type { SSEEvent } from "@/lib/sse-bus";

export function useSSE(onEvent: (event: SSEEvent) => void, enabled = true) {
  const onEventRef = useRef(onEvent);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    if (!enabled) return;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;
    let stopped = false;

    function connect() {
      if (stopped) return;
      es = new EventSource("/api/sse");

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as SSEEvent;
          onEventRef.current(event);
        } catch { /* malformed frame */ }
      };

      es.onopen = () => { retryDelay = 1000; };

      es.onerror = () => {
        es?.close();
        es = null;
        if (!stopped) {
          retryTimeout = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30_000);
            connect();
          }, retryDelay);
        }
      };
    }

    connect();

    return () => {
      stopped = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
  }, [enabled]);
}
