"use client";

import { useState } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";

const PRINT_ERRORS = [
  "ERREUR : Imprimante hors ligne. Elle a toujours été hors ligne.",
  "ERREUR : Bourrage papier (plateau 1, 2 et 3).",
  "ERREUR : Encre noire vide. Encre couleur aussi. En fait toutes.",
  "ERREUR : Pilote introuvable. Il n'a jamais été trouvé.",
  "ERREUR : Pilote USB perdu au redémarrage de mardi. Il n'est pas revenu.",
  "ERREUR : Le papier n'est pas du bon format (GunthOS attend du A4½).",
  "AVERTISSEMENT : Plateau vide depuis l'installation. L'imprimante n'a jamais vu de papier.",
  "ERREUR : Imprimante reconnectée. Reconnexion ignorée par l'imprimante.",
  "SUCCÈS : Document imprimé. Sur l'imprimante de votre voisin.",
  "SUCCÈS : Document mis en file d'attente derrière 'Photo_vacances_1999.bmp' (en cours depuis 2h14).",
];

export function PrinterApp(_: AppProps) {
  const [queue, setQueue] = useState<{ name: string; status: string; pages: number }[]>([
    { name: "Document1.doc", status: "En attente depuis 2003", pages: 47 },
    { name: "CV_FINAL_v12.doc", status: "Bloqué (bourrage papier)", pages: 3 },
    { name: "Photo_vacances_1999.bmp", status: "En cours d'impression (3%)", pages: 1 },
  ]);
  const [log, setLog] = useState<string[]>([]);

  function handlePrint() {
    const msg = pickRandom(PRINT_ERRORS)!;
    setLog((l) => [msg, ...l].slice(0, 5));
    setQueue((q) => [
      ...q,
      {
        name: `Nouveau_document_${q.length + 1}.txt`,
        status: "En attente",
        pages: Math.floor(Math.random() * 20) + 1,
      },
    ]);
  }

  function handleClear() {
    setLog([]);
    setQueue((q) => q.filter((_, i) => i === 0));
  }

  return (
    <div className="p-4 flex flex-col gap-3" style={{ fontFamily: "var(--t-font-display)" }}>
      <div className="flex items-center gap-3">
        <span className="text-4xl">🖨️</span>
        <div>
          <div className="text-sm font-bold tracking-widest" style={{ color: "var(--t-accent)" }}>
            GunthPrint 3000™
          </div>
          <div className="text-sm tracking-wider" style={{ color: "var(--t-text-muted)" }}>
            État : HORS LIGNE (permanent) — Encre : ▓░░░░░░░░░ 3%
          </div>
        </div>
      </div>

      <div
        className="border-[2px]"
        style={{
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        <div
          className="px-2 py-1 text-sm tracking-widest border-b font-bold"
          style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text)", backgroundColor: "var(--t-bg-dark)" }}
        >
          FILE D&apos;IMPRESSION ({queue.length} document{queue.length > 1 ? "s" : ""})
        </div>
        {queue.map((doc, i) => (
          <div
            key={i}
            className="px-2 py-1.5 border-b flex justify-between items-center text-sm tracking-wider"
            style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text)" }}
          >
            <span>📄 {doc.name}</span>
            <span style={{ color: "var(--t-text-muted)" }}>{doc.pages}p — {doc.status}</span>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div
          className="border-[2px] p-2 text-sm tracking-wider flex flex-col gap-1"
          style={{
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            backgroundColor: "var(--t-inset-from)",
            color: "var(--t-defrag-fragmented, #cc2200)",
          }}
        >
          {log.map((l, i) => <div key={i}>⚠ {l}</div>)}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handlePrint}
          className="px-4 py-1 border-[2px] text-sm tracking-widest cursor-pointer"
          style={{
            backgroundColor: "var(--t-bg)",
            color: "var(--t-text)",
            fontFamily: "var(--t-font-display)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
        >
          🖨️ Imprimer
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-1 border-[2px] text-sm tracking-widest cursor-pointer"
          style={{
            backgroundColor: "var(--t-bg)",
            color: "var(--t-text)",
            fontFamily: "var(--t-font-display)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
        >
          Vider la file (inutile)
        </button>
      </div>
    </div>
  );
}
