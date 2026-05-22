"use client";

import { useCallback, useRef } from "react";
import type { RefObject } from "react";
import type { CelebrationOptions } from "@/types/plouf-plouf";
import type { useSound } from "./use-sound";
import type { useCelebration } from "./use-celebration";

interface UseCelebrationEffectsOptions {
  flashRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  winnerContainerRef: RefObject<HTMLDivElement | null>;
  winnerBigRef: RefObject<HTMLDivElement | null>;
  winnerSubRef: RefObject<HTMLDivElement | null>;
  marqueeTopRef: RefObject<HTMLDivElement | null>;
  marqueeBottomRef: RefObject<HTMLDivElement | null>;
  sound: ReturnType<typeof useSound>;
  startCelebration: ReturnType<typeof useCelebration>["start"];
}

const DAMAGE_TEXTS = ["+999", "CRIT!", "+XP", "!!1!", "9999", "WIN", "x10", "+500", "GG", "1UP"];

export function useCelebrationEffects({
  flashRef,
  containerRef,
  winnerContainerRef,
  winnerBigRef,
  winnerSubRef,
  marqueeTopRef,
  marqueeBottomRef,
  sound,
  startCelebration,
}: UseCelebrationEffectsOptions) {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const spawnDamageNumbers = useCallback((o: CelebrationOptions) => {
    const count = Math.min(15, Math.floor(o.density / 15));
    for (let i = 0; i < count; i++) {
      const id = setTimeout(() => {
        const el = document.createElement("div");
        el.style.cssText = [
          "position:fixed",
          "font-family:'VT323',monospace",
          "font-weight:700",
          "font-size:2.5rem",
          "z-index:9996",
          "pointer-events:none",
          "color:#ffff00",
          "text-shadow:3px 3px 0 #000,-2px -2px 0 #000,0 0 20px #ff00ff",
          "animation:damageFloat 1.2s ease-out forwards",
          "letter-spacing:2px",
          `left:${Math.random() * 80 + 10}%`,
          `top:${Math.random() * 60 + 20}%`,
        ].join(";");
        el.textContent = DAMAGE_TEXTS[Math.floor(Math.random() * DAMAGE_TEXTS.length)] ?? "+999";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1200);
      }, i * 100);
      timeoutsRef.current.push(id);
    }
  }, []);

  const trigger = useCallback(
    (name: string, o: CelebrationOptions) => {
      if (o.flash && flashRef.current) {
        flashRef.current.classList.remove("animate-[flashAnim_0.4s_ease-out]");
        void flashRef.current.offsetWidth;
        flashRef.current.classList.add("animate-[flashAnim_0.4s_ease-out]");
      }

      if (o.shake > 0 && containerRef.current) {
        const el = containerRef.current;
        el.classList.add("animate-[shake_0.08s_linear_infinite]");
        const id = setTimeout(
          () => el.classList.remove("animate-[shake_0.08s_linear_infinite]"),
          o.duration * 400
        );
        timeoutsRef.current.push(id);
      }

      if (o.bigText && winnerBigRef.current) {
        const big = winnerBigRef.current;
        const container = winnerContainerRef.current;
        big.textContent = name;
        big.style.animation = "none";
        void big.offsetWidth;
        big.style.animation = "";
        big.classList.add("active");

        if (o.text && winnerSubRef.current) {
          winnerSubRef.current.textContent = `★ ${o.text} ★`;
          winnerSubRef.current.classList.add("active");
        }

        if (container) container.style.display = "flex";

        const id = setTimeout(() => {
          big.classList.remove("active");
          if (winnerSubRef.current) {
            winnerSubRef.current.classList.remove("active");
          }
          if (container) container.style.display = "none";
        }, o.duration * 1000);
        timeoutsRef.current.push(id);
      }

      if (o.marquee) {
        const text = `  ★  ${name}  ★  WINNER  ★  ${name}  ★  CHAMPION  ★  ${name}  ★  `.repeat(6);
        if (marqueeTopRef.current) {
          marqueeTopRef.current.querySelector(".inner")!.textContent = text;
          marqueeTopRef.current.style.display = "block";
        }
        if (marqueeBottomRef.current) {
          marqueeBottomRef.current.querySelector(".inner")!.textContent = text;
          marqueeBottomRef.current.style.display = "block";
        }
        const id = setTimeout(() => {
          if (marqueeTopRef.current) marqueeTopRef.current.style.display = "none";
          if (marqueeBottomRef.current) marqueeBottomRef.current.style.display = "none";
        }, o.duration * 1000);
        timeoutsRef.current.push(id);
      }

      if (o.bgPulse) {
        document.body.classList.add("animate-[bgPulse_0.4s_ease-in-out_infinite_alternate]");
        const id = setTimeout(
          () => document.body.classList.remove("animate-[bgPulse_0.4s_ease-in-out_infinite_alternate]"),
          o.duration * 1000
        );
        timeoutsRef.current.push(id);
      }

      if (o.damageNumbers) spawnDamageNumbers(o);

      sound.playVictory();
      startCelebration(o);
    },
    [flashRef, containerRef, winnerBigRef, winnerSubRef, marqueeTopRef, marqueeBottomRef, sound, startCelebration, spawnDamageNumbers]
  );

  return { trigger };
}
