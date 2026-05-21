"use client";

import { useState } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
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
  onClose: () => void;
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
            onClick={onClose}
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
              onClick={onClose}
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

const TRASH_FILES = [
  { icon: "🖼️", name: "bukake_facials_vol3_FINAL.avi", size: "4.2 GB", date: "14/02/2003" },
  { icon: "📄", name: "lettre_a_maman_BROUILLON(7).doc", size: "2 Ko", date: "24/12/2001" },
  { icon: "🖼️", name: "selfie_salle_de_bain_nu_artistique.jpg", size: "3.8 Mo", date: "03/08/2002" },
  { icon: "📄", name: "poeme_a_stacy_jamais_envoye.txt", size: "1 Ko", date: "14/02/2002" },
  { icon: "🎵", name: "celine_dion_best_of_extended_remix.mp3", size: "128 Mo", date: "19/06/2001" },
  { icon: "🖼️", name: "femmes_matures_du_quartier_photos(1).zip", size: "2.1 Go", date: "11/11/2002" },
  { icon: "📄", name: "budget_casino_en_ligne_pertes_2003.xls", size: "18 Ko", date: "01/01/2003" },
  { icon: "🎮", name: "Kazaa_crack_keygen_virus_pas_de_virus.exe", size: "668 Ko", date: "07/07/2002" },
  { icon: "🖼️", name: "voisine_piscine_zoom_max.jpg", size: "5.7 Mo", date: "22/07/2002" },
  { icon: "📄", name: "recherches_google_a_effacer_URGENT.txt", size: "88 Ko", date: "09/09/2002" },
  { icon: "🎵", name: "remix_technor_hard_gabber_piste1_WIP.mp3", size: "44 Mo", date: "31/10/2001" },
  { icon: "🖼️", name: "pieds_echange_coquin_annonce.bmp", size: "9.3 Mo", date: "13/04/2003" },
  { icon: "📄", name: "EXCUSES_RETARD_LOYER_v4_DEFINITIF.doc", size: "4 Ko", date: "03/03/2003" },
  { icon: "💾", name: "backup_mots_de_passe_NE_PAS_OUVRIR.txt", size: "512 o", date: "01/01/2000" },
  { icon: "🖼️", name: "milf_hunter_ep47_complet_VF.avi", size: "700 Mo", date: "20/09/2002" },
  { icon: "📄", name: "liste_envies_achats_pas_raisonnables.txt", size: "6 Ko", date: "25/12/2002" },
];

const TRASH_HEADERS = [
  "Corbeille — 47 éléments — Espace occupé : 11,4 Go",
  "Corbeille — Pleine depuis 2002. Comme le reste.",
  "Corbeille — Ces fichiers méritaient mieux... ou pas.",
  "Corbeille — Supprimés mais pas oubliés. Surtout pas.",
];

export function TrashApp(_: AppProps) {
  const [header] = useState(() => pickRandom(TRASH_HEADERS));
  const [selected, setSelected] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  function handleFileAction(file: typeof TRASH_FILES[0]) {
    if (file.name.includes("backup_mots")) {
      setDialog({ icon: "🔒", title: "Accès refusé", message: "Ce fichier est protégé par un mot de passe. Le mot de passe est « password1 ».", buttons: [{ label: "Merci" }] });
    } else if (file.name.includes("lettre_a_maman") || file.name.includes("poeme")) {
      setDialog({ icon: "😢", title: "Êtes-vous sûr ?", message: "Ce fichier contient peut-être des émotions. Voulez-vous vraiment le supprimer définitivement ?", buttons: [{ label: "Supprimer quand même" }, { label: "Pleurer et annuler" }] });
    } else if (file.name.includes(".exe")) {
      setDialog({ icon: "⚠️", title: "ALERTE VIRUS !", message: "GunthAntivirus™ a détecté : Trojan.HentaiLoader.666\n\nMais t'inquiète, il est sympa celui-là.", buttons: [{ label: "Mettre en quarantaine" }, { label: "Lui faire confiance" }] });
    } else if (file.name.includes(".avi") || file.name.includes(".bmp") || file.name.includes("photos")) {
      setDialog({ icon: "👀", title: "Lecture impossible", message: `Le fichier « ${file.name} » nécessite le codec DivX 3.11 et une bonne excuse.`, buttons: [{ label: "Télécharger le codec" }, { label: "Fermer et nier" }] });
    } else {
      setDialog({ icon: "🗑️", title: "Restaurer ?", message: `Voulez-vous restaurer « ${file.name} » sur le bureau ?\n\nRéfléchissez bien.`, buttons: [{ label: "Restaurer" }, { label: "Laisser pourrir" }] });
    }
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <div
        className="text-center p-3 border-[2px] mb-3"
        style={{
          background: "linear-gradient(to bottom, var(--t-inset-from), var(--t-inset-to))",
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
        }}
      >
        <div className="text-4xl mb-1">🗑️</div>
        <h2 className="text-lg tracking-widest" style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}>
          CORBEILLE
        </h2>
        <p className="text-xs mt-0.5 tracking-wider" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
          {header}
        </p>
      </div>

      <div
        className="border-[2px] flex-1 overflow-y-auto"
        style={{
          borderTopColor: "var(--t-border-dark)",
          borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)",
          borderRightColor: "var(--t-border-light)",
          background: "var(--t-inset-from)",
        }}
      >
        <div
          className="grid grid-cols-[2rem_1fr_6rem_6rem] gap-2 px-2 py-1 border-b-2 text-xs tracking-widest sticky top-0"
          style={{
            fontFamily: "var(--t-font-display)",
            color: "var(--t-text-muted)",
            borderColor: "var(--t-border-dark)",
            background: "var(--t-bg)",
          }}
        >
          <span></span>
          <span>Nom</span>
          <span className="text-right">Taille</span>
          <span className="text-right">Supprimé le</span>
        </div>
        {TRASH_FILES.map((file) => (
          <button
            key={file.name}
            className="grid grid-cols-[2rem_1fr_6rem_6rem] gap-2 w-full px-2 py-1 text-left cursor-default focus:outline-none"
            style={{
              fontFamily: "var(--t-font-display)",
              backgroundColor: selected === file.name ? "var(--t-card-hover)" : "transparent",
            }}
            onClick={() => setSelected(file.name)}
            onDoubleClick={() => handleFileAction(file)}
            onFocus={() => setSelected(file.name)}
          >
            <span className="text-base leading-none">{file.icon}</span>
            <span className="text-xs truncate" style={{ color: "var(--t-text)" }}>{file.name}</span>
            <span className="text-xs text-right" style={{ color: "var(--t-text-muted)" }}>{file.size}</span>
            <span className="text-xs text-right" style={{ color: "var(--t-text-muted)" }}>{file.date}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 text-xs text-center tracking-wider" style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}>
        Double-cliquez pour ouvrir • Les suppressions définitives ne seront pas commentées
      </div>

      {dialog && <GunthDialog config={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}
