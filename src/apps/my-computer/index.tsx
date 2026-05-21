"use client";

import { useState } from "react";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { GUNTH_STATUS, pickRandom } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";

interface DialogConfig {
  icon: string;
  title: string;
  message: string;
  buttons?: { label: string; response?: string }[];
}

function GunthDialog({
  config,
  onClose,
}: {
  config: DialogConfig;
  onClose: (response?: string) => void;
}) {
  const buttons = config.buttons ?? [{ label: "OK" }];
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="border-[3px] min-w-[280px] max-w-[360px]"
        style={{
          backgroundColor: "var(--t-glass-bg)",
          backdropFilter: "var(--t-glass-blur)",
          WebkitBackdropFilter: "var(--t-glass-blur)",
          borderTopColor: "var(--t-border-light)",
          borderLeftColor: "var(--t-border-light)",
          borderBottomColor: "var(--t-border-dark)",
          borderRightColor: "var(--t-border-dark)",
          borderRadius: "var(--t-window-radius)",
          boxShadow: "var(--t-dialog-shadow)",
          fontFamily: "var(--t-font-display)",
          overflow: "hidden",
        }}
      >
        <div
          className="px-2 py-1 flex items-center justify-between border-b-2 border-black select-none"
          style={{
            background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            color: "var(--t-titlebar-text)",
          }}
        >
          <span className="text-sm tracking-widest font-bold">{config.icon} {config.title}</span>
          <button
            className="w-5 h-5 flex items-center justify-center text-xs border cursor-pointer"
            style={{ background: "var(--t-bg)", color: "var(--t-text)" }}
            onClick={() => onClose()}
          >✕</button>
        </div>

        <div className="flex gap-3 items-start p-4">
          <span className="text-3xl shrink-0">{config.icon}</span>
          <p className="text-sm tracking-wide leading-relaxed" style={{ color: "var(--t-text)" }}>
            {config.message}
          </p>
        </div>

        <div className="flex justify-center gap-2 pb-4 px-4">
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => onClose(btn.response ?? btn.label)}
              className="px-6 py-1 border-[2px] text-sm tracking-widest cursor-pointer min-w-[72px]"
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
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const MY_COMPUTER_JOKES = [
  "Toute ressemblance avec Windows est purement intentionnelle.",
  "Propriété de Gunth Corp™. Ne pas ouvrir le boîtier.",
  "Processeur : Pentium II 233 MHz. Surpuissant pour vos besoins.",
  "Garantie expirée le 14 janvier 2002.",
  "Votre ordinateur a besoin d'être redémarré. Comme toujours.",
  "Pilote de son introuvable. Vous entendrez quand même.",
  "Mémoire disponible : suffisante pour ce que vous faites là.",
];

const DISK_C_JOKES = [
  "Disque C:\\ — 0 octets libres. Comme d'habitude.",
  "Disque C:\\ — Plein depuis 2002. Supprimez vos MP3.",
  "Disque C:\\ — Fragmentation : 97%. Bonne chance.",
  "Disque C:\\ — Erreur SMART détectée. Ignorez.",
];

const DISK_D_JOKES = [
  "Lecteur D:\\ — Veuillez insérer le CD-ROM « GunthOS SP2 »",
  "Lecteur D:\\ — Disque non reconnu. Soufflez dedans.",
  "Lecteur D:\\ — Aucun média inséré (depuis l'usine).",
];

const DOCS_JOKES = [
  "Mes Documents — 847 fichiers nommés « SANS TITRE (1).doc »",
  "Mes Documents — Dernière sauvegarde : jamais.",
  "Mes Documents — Dossier vide. Vos données sont ailleurs.",
];

export function MyComputerApp(_: AppProps) {
  const [joke] = useState(() => pickRandom(MY_COMPUTER_JOKES));
  const [status] = useState(() => pickRandom(GUNTH_STATUS));
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const { openWindow } = useWindowManager();

  const ITEMS = [
    {
      icon: "💾", label: "Disque C:\\",
      onClick: () => setDialog({
        icon: "💾",
        title: "Disque C:\\",
        message: pickRandom(DISK_C_JOKES)!,
        buttons: [{ label: "Défragmenter", response: "defrag" }, { label: "Ignorer" }],
      }),
    },
    {
      icon: "💿", label: "Lecteur D:\\",
      onClick: () => setDialog({
        icon: "💿",
        title: "Lecteur D:\\",
        message: pickRandom(DISK_D_JOKES)!,
        buttons: [{ label: "Souffler dedans" }, { label: "Réessayer" }],
      }),
    },
    {
      icon: "🖨️", label: "Imprimante",
      onClick: () => openWindow("printer", "GunthPrint 3000™", "🖨️"),
    },
    {
      icon: "📂", label: "Mes Documents",
      onClick: () => setDialog({
        icon: "📂",
        title: "Mes Documents",
        message: pickRandom(DOCS_JOKES)!,
        buttons: [{ label: "Récupérer" }, { label: "Pleurer" }],
      }),
    },
    {
      icon: "🌐", label: "Internet",
      onClick: () => openWindow("ie", "Internet Explorer 6 — GunthOS Edition", "🌐"),
    },
    {
      icon: "🃏", label: "Solitaire",
      onClick: () => openWindow("solitaire", "Solitaire GunthOS™", "🃏"),
    },
    {
      icon: "🗂️", label: "Défragmenteur",
      onClick: () => openWindow("defrag", "Défragmenteur de disque", "🗂️"),
    },
    {
      icon: "📝", label: "Bloc-notes",
      onClick: () => openWindow("notepad", "Bloc-notes — UNTITLED.txt", "📝"),
    },
  ];

  return (
    <div className="p-6">
      <div
        className="text-center p-4 border-[2px] mb-4"
        style={{
          background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        <div className="text-5xl mb-2">🖥️</div>
        <h2 className="text-2xl tracking-widest" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>
          MON ORDINATEUR
        </h2>
        <p className="text-sm mt-1 tracking-wider" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
          GunthOS v1.0 — {joke}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            onDoubleClick={item.onClick}
            onClick={(e) => { if (e.detail === 1) e.currentTarget.focus(); }}
            className="flex flex-col items-center gap-1 p-3 border-[2px] cursor-default focus:outline-none"
            style={{
              backgroundColor: "transparent",
              borderColor: "transparent",
              fontFamily: "var(--t-font-display)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = "var(--t-card-hover)";
              e.currentTarget.style.borderColor = "var(--t-accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm text-center tracking-wider leading-tight" style={{ color: "var(--t-text)" }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div
        className="mt-4 text-center text-sm tracking-wider py-2 border-t"
        style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)", borderTopColor: "var(--t-border-dark)" }}
      >
        {status}
      </div>
      <div className="text-center text-sm tracking-wider" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
        Double-cliquez pour ouvrir
      </div>

      {dialog && (
        <GunthDialog
          config={dialog}
          onClose={(response) => {
            setDialog(null);
            if (response === "defrag") openWindow("defrag", "Défragmenteur de disque", "🗂️");
          }}
        />
      )}
    </div>
  );
}
