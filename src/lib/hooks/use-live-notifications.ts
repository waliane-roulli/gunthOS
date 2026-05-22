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
        if (payload.kind === "tts") {
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(payload.text);
            utt.lang = payload.lang ?? "fr-FR";
            utt.pitch = payload.pitch ?? 1;
            utt.rate = payload.rate ?? 1;
            window.speechSynthesis.speak(utt);
          }
          return;
        }
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
