"use client";

import { useEffect, useRef } from "react";
import { GUNTH_TITLES } from "@/lib/gunth-jokes";
import { pickRandom } from "@/lib/utils/random";

const FAVICON_EMOJIS = ["💾", "🖥️", "📟", "🖨️", "🕹️", "📼", "💿", "📡", "🔌", "⌨️", "🖱️", "📠"];

function renderEmojiToDataUrl(emoji: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 32, 32);
  ctx.font = "26px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 16, 17);
  return canvas.toDataURL("image/png");
}

function setFavicon(dataUrl: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = dataUrl;
}

const SCROLL_SPEED = 150; // ms par caractère
const PAUSE_FULL = 3000; // pause quand le titre complet est affiché
const SEPARATOR = "   ·   ";

export function GunthTitle() {
  const titleRef = useRef<string>("");
  const posRef = useRef<number>(0);
  const scrollIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const titleIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // --- Favicon rotative ---
    const faviconId = setInterval(() => {
      const emoji = pickRandom(FAVICON_EMOJIS);
      setFavicon(renderEmojiToDataUrl(emoji));
    }, 5_000);
    setFavicon(renderEmojiToDataUrl(pickRandom(FAVICON_EMOJIS)));

    // --- Titre défilant ---
    function startScrolling(text: string) {
      if (scrollIdRef.current) clearInterval(scrollIdRef.current);
      const full = text + SEPARATOR;
      posRef.current = 0;

      // Affiche d'abord le texte complet brièvement
      document.title = text;

      setTimeout(() => {
        scrollIdRef.current = setInterval(() => {
          const looped = full + full;
          const visible = looped.slice(posRef.current, posRef.current + 40);
          document.title = visible;
          posRef.current = (posRef.current + 1) % full.length;
        }, SCROLL_SPEED);
      }, PAUSE_FULL);
    }

    function pickAndScroll() {
      const t = pickRandom(GUNTH_TITLES);
      titleRef.current = t;
      startScrolling(t);
    }

    pickAndScroll();
    titleIdRef.current = setInterval(() => {
      if (scrollIdRef.current) clearInterval(scrollIdRef.current);
      pickAndScroll();
    }, 20_000);

    return () => {
      clearInterval(faviconId);
      if (scrollIdRef.current) clearInterval(scrollIdRef.current);
      if (titleIdRef.current) clearInterval(titleIdRef.current);
    };
  }, []);

  return null;
}
