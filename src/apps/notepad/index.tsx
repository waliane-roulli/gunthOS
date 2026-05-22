"use client";

import { useState } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";

const NOTEPAD_PLACEHOLDER = `Bienvenue dans Bloc-Notes GunthOS.

Ce fichier a été créé automatiquement par GunthOS
lors d'une mise à jour du 25/03/1998.

NE PAS SUPPRIMER CE FICHIER
(suppression interdite par le CLUF GunthOS §47.3.b)

Contenu du fichier système :
> ERREUR_LECTURE_SECTEUR_847
> ERREUR_LECTURE_SECTEUR_848
> ERREUR_LECTURE_SECTEUR_849
> [données corrompues]
> [données corrompues]
> TODO: réparer les données corrompues

GunthOS vous remercie de votre confiance.`;

const SAVE_RESPONSES = [
  "Sauvegardé dans C:\\GUNTH\\TEMP\\UNTITLED(1).txt",
  "Sauvegardé… ou pas. Le disque est plein.",
  "Fichier sauvegardé. Écrasement de la sauvegarde précédente.",
  "Erreur : impossible de sauvegarder. Sauvegardé quand même.",
  "Sauvegardé dans C:\\WINDOWS\\TEMP\\~WRK47.tmp (sera supprimé au prochain redémarrage).",
  "Fichier sauvegardé. L'antivirus l'a mis en quarantaine par précaution.",
  "Sauvegardé sur disquette 3½ (secteur 847 ignoré).",
  "Fichier écrit. Format inconnu. Contenu préservé à 73%.",
  "Sauvegarde réussie. Version précédente dans la corbeille. La corbeille est pleine.",
  "Enregistré dans un fichier temporaire qui le restera.",
  "Sauvegardé. GunthOS ne garantit pas la relecture.",
  "Ctrl+S intercepté. Fichier écrit dans un dossier mystère.",
];

export function NotepadApp(_: AppProps) {
  const [text, setText] = useState(NOTEPAD_PLACEHOLDER);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);

  function handleSave() {
    setSaved(true);
    setSaveCount((c) => c + 1);
    setTimeout(() => setSaved(false), 3000);
  }

  const saveMsg = saveCount > 0
    ? `Sauvegarde ${saveCount} effectuée. Les ${saveCount - 1} précédentes ont été perdues.`
    : pickRandom(SAVE_RESPONSES)!;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      <div
        className="flex gap-4 px-2 py-0.5 text-sm border-b shrink-0"
        style={{ borderColor: "var(--t-border-dark)", color: "var(--t-text)" }}
      >
        {["Fichier", "Édition", "Format", "Affichage", "Aide"].map((m) => (
          <button
            key={m}
            className="hover:opacity-70 cursor-pointer tracking-wider"
            onClick={m === "Fichier" ? handleSave : undefined}
            style={{ background: "none", border: "none", color: "inherit", fontFamily: "inherit" }}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        className="flex-1 p-2 resize-none text-sm tracking-wide outline-none"
        style={{
          backgroundColor: "var(--t-app-bg)",
          color: "var(--t-app-text)",
          fontFamily: "var(--t-font-mono)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          border: "none",
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />

      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0"
        style={{
          borderColor: "var(--t-border-dark)",
          color: "var(--t-text-muted)",
          backgroundColor: "var(--t-bg)",
        }}
      >
        {saved
          ? `✅ ${saveMsg}`
          : `Ligne 1, Col 1 — ${text.length} caractères — Encodage : GUNTH-1252`}
      </div>
    </div>
  );
}
