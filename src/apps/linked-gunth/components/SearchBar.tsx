"use client";

import { useState, useRef } from "react";
import { pick } from "../helpers";
import { SEARCH_RESULTS } from "../constants";

export function SearchBar({ playBip, showToast }: { playBip: () => void; showToast: (m: string) => void }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    if (!query.trim()) return;
    playBip();
    setSearching(true);
    setResult(null);
    setTimeout(() => {
      setSearching(false);
      const msg = pick(SEARCH_RESULTS)(query.trim());
      setResult(msg);
      showToast(msg);
    }, 900 + Math.random() * 600);
  }

  return (
    <div className="relative flex items-center gap-1 px-2 py-0.5 border-2 flex-1 min-w-0" style={{ borderTopColor: "rgba(0,0,0,0.5)", borderLeftColor: "rgba(0,0,0,0.5)", borderBottomColor: "rgba(255,255,255,0.2)", borderRightColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.15)" }}>
      <span className="text-xs opacity-70">🔍</span>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setResult(null); }}
        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        placeholder={searching ? "Recherche en cours..." : "opportunités..."}
        className="bg-transparent border-none outline-none text-sm flex-1 min-w-0"
        style={{ fontFamily: "var(--t-font-display)", color: "var(--t-titlebar-text)", opacity: 0.85 }}
      />
      {query && !searching && (
        <button onClick={handleSearch} className="text-[0.65rem] px-1 border opacity-70 hover:opacity-100" style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--t-titlebar-text)", backgroundColor: "transparent" }}>OK</button>
      )}
      {searching && <span className="text-xs animate-[blink_0.5s_step-end_infinite]" style={{ color: "var(--t-titlebar-text)" }}>⏳</span>}
      {result && !searching && (
        <button onClick={() => { setResult(null); setQuery(""); }} className="text-xs opacity-50" style={{ color: "var(--t-titlebar-text)", backgroundColor: "transparent", border: "none" }}>✕</button>
      )}
    </div>
  );
}
