"use client";

import { useEffect } from "react";
import { raisedStyle } from "../helpers";

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-1.5 border-2 text-sm whitespace-nowrap"
      style={{
        fontFamily: "var(--t-font-display)",
        backgroundColor: "var(--t-accent)",
        color: "var(--t-titlebar-text)",
        borderTopColor: "var(--t-accent-hover)",
        borderLeftColor: "var(--t-accent-hover)",
        borderBottomColor: "var(--t-border-dark)",
        borderRightColor: "var(--t-border-dark)",
        animation: "blink 0.12s step-end 1",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDone}
        className="ml-1 opacity-70 hover:opacity-100 leading-none border-none bg-transparent"
        style={{ color: "var(--t-titlebar-text)", fontSize: "var(--t-text-base)" }}
      >✕</button>
    </div>
  );
}

export function Confetti({ onDone }: { onDone: () => void }) {
  const pieces = ["🎉", "⭐", "🚀", "💡", "✨", "🎊", "🏆", "💼"];
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="absolute inset-0 pointer-events-none z-[70] overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-lg"
          style={{
            left: `${5 + (i * 6.2) % 90}%`,
            top: "-20px",
            animation: `fall ${0.9 + (i % 5) * 0.25}s linear ${(i % 8) * 0.12}s forwards`,
          }}
        >
          {pieces[i % pieces.length]}
        </div>
      ))}
      <style>{`@keyframes fall { to { top: 110%; opacity: 0; } }`}</style>
    </div>
  );
}

export function DialogShell({ title, onClose, children, width = "420px" }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
      <div className="overflow-hidden border-2 max-w-[95%]" style={{ width, borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
        <div className="flex justify-between items-center px-2 py-1" style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)" }}>
          <span style={{ fontFamily: "var(--t-font-display)" }}>{title}</span>
          <button onClick={onClose} className="px-1.5 text-sm border-2" style={{ backgroundColor: "transparent", color: "var(--t-titlebar-text)", borderTopColor: "rgba(255,255,255,0.3)", borderLeftColor: "rgba(255,255,255,0.3)", borderBottomColor: "rgba(0,0,0,0.3)", borderRightColor: "rgba(0,0,0,0.3)" }}>✕</button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

export function ConnectionRequestPopup({ request, onAccept, onDecline }: {
  request: { name: string; title: string; emoji: string; mutual: number };
  onAccept: () => void; onDecline: () => void;
}) {
  return (
    <div className="absolute top-12 right-2 z-[65] w-64 border-2 shadow-lg" style={{ borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)", borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}>
      <div className="px-2 py-1 text-xs" style={{ background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))", color: "var(--t-titlebar-text)", fontFamily: "var(--t-font-display)" }}>
        🤝 Nouvelle invitation
      </div>
      <div className="p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">{request.emoji}</div>
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--t-text)", fontFamily: "var(--t-font-display)" }}>{request.name}</div>
            <div className="text-xs" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>{request.title}</div>
            {request.mutual > 0 && (
              <div className="text-[0.65rem]" style={{ color: "var(--t-text-subtle)", fontFamily: "var(--t-font-display)" }}>{request.mutual} relation(s) en commun</div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onAccept} className="flex-1 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle(true) }}>Accepter</button>
          <button onClick={onDecline} className="flex-1 py-0.5 text-xs border-2" style={{ fontFamily: "var(--t-font-body)", ...raisedStyle() }}>Ignorer</button>
        </div>
      </div>
    </div>
  );
}
