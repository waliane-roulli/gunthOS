"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { OsWindow } from "./os-window";
import { SettingsPanel } from "./settings-panel";
import { RetroTitlebarBtn } from "./retro-titlebar-btn";
import { SolitaireApp, DefragApp, NotepadApp, PrinterApp, IEApp } from "./fake-apps";
import { ProfileApp, PublicProfileApp, UserDirectoryApp } from "./profile-app";
import { MsnApp } from "./msn-app";
import { RadioApp } from "./radio-app";
import { LoginWindow } from "./login-window";
import { GUNTH_STATUS, pickRandom } from "@/lib/gunth-jokes";
import { useSoundContext } from "@/lib/contexts/sound-context";

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
        {/* Titlebar */}
        <div
          className="px-2 py-1 flex items-center justify-between border-b-2 border-black select-none"
          style={{
            background: "linear-gradient(to right, var(--t-titlebar-from), var(--t-titlebar-to))",
            color: "var(--t-titlebar-text)",
            borderRadius: "calc(var(--t-titlebar-radius) - 1px) calc(var(--t-titlebar-radius) - 1px) 0 0",
          }}
        >
          <span className="text-sm tracking-widest font-bold">{config.icon} {config.title}</span>
          <RetroTitlebarBtn size={18} onClick={() => onClose()}>✕</RetroTitlebarBtn>
        </div>

        {/* Body */}
        <div className="flex gap-3 items-start p-4">
          <span className="text-3xl shrink-0">{config.icon}</span>
          <p
            className="text-sm tracking-wide leading-relaxed"
            style={{ color: "var(--t-text)" }}
          >
            {config.message}
          </p>
        </div>

        {/* Buttons */}
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

const PloufApp = dynamic(
  () =>
    import("@/components/plouf-plouf/plouf-app").then((m) => ({
      default: m.PloufApp,
    })),
  { ssr: false }
);

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

function MyComputerContent() {
  const [joke] = useState(() => pickRandom(MY_COMPUTER_JOKES));
  const [status] = useState(() => pickRandom(GUNTH_STATUS));
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const { openWindow } = useWindowManager();

  function showDialog(cfg: DialogConfig) {
    setDialog(cfg);
  }

  const ITEMS = [
    {
      icon: "💾", label: "Disque C:\\",
      onClick: () => showDialog({
        icon: "💾",
        title: "Disque C:\\",
        message: pickRandom(DISK_C_JOKES)!,
        buttons: [{ label: "Défragmenter", response: "defrag" }, { label: "Ignorer" }],
      }),
    },
    {
      icon: "💿", label: "Lecteur D:\\",
      onClick: () => showDialog({
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
      onClick: () => showDialog({
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
        <h2
          className="text-2xl tracking-widest"
          style={{ color: "var(--t-accent)", fontFamily: "var(--t-font-display)" }}
        >
          MON ORDINATEUR
        </h2>
        <p
          className="text-sm mt-1 tracking-wider"
          style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
        >
          GunthOS v1.0 — {joke}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            onDoubleClick={item.onClick}
            onClick={(e) => { if (e.detail === 1) e.currentTarget.focus(); }}
            className="flex flex-col items-center gap-1 p-3 border-[2px] cursor-default focus:outline-none group"
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
            <span
              className="text-sm text-center tracking-wider leading-tight"
              style={{ color: "var(--t-text)" }}
            >
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
      <div
        className="text-center text-sm tracking-wider"
        style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
      >
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

function TrashContent() {
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
        {/* Column headers */}
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
              borderBottom: "1px solid transparent",
            }}
            onClick={() => setSelected(file.name)}
            onDoubleClick={() => handleFileAction(file)}
            onFocus={() => setSelected(file.name)}
          >
            <span className="text-base leading-none">{file.icon}</span>
            <span
              className="text-xs truncate"
              style={{ color: "var(--t-text)" }}
            >
              {file.name}
            </span>
            <span className="text-xs text-right" style={{ color: "var(--t-text-muted)" }}>{file.size}</span>
            <span className="text-xs text-right" style={{ color: "var(--t-text-muted)" }}>{file.date}</span>
          </button>
        ))}
      </div>

      <div
        className="mt-2 text-xs text-center tracking-wider"
        style={{ color: "var(--t-text-muted)", fontFamily: "var(--t-font-display)" }}
      >
        Double-cliquez pour ouvrir • Les suppressions définitives ne seront pas commentées
      </div>

      {dialog && (
        <GunthDialog config={dialog} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}

const APP_COMPONENTS: Partial<Record<string, () => React.ReactElement>> = {
  "my-computer": () => <MyComputerContent />,
  "trash": () => <TrashContent />,
  solitaire: () => <SolitaireApp />,
  defrag: () => <DefragApp />,
  notepad: () => <NotepadApp />,
  printer: () => <PrinterApp />,
  ie: () => <IEApp />,
  profile: () => <ProfileApp />,
  directory: () => <UserDirectoryApp />,
  msn: () => <MsnApp />,
  radio: () => <RadioApp />,
};

// Durée de chargement simulée par app (ms)
const LOAD_DURATIONS: Record<string, number> = {
  "plouf-plouf": 1600,
  "my-computer": 1000,
  trash: 600,
  solitaire: 1300,
  defrag: 1800,
  notepad: 800,
  printer: 1500,
  ie: 2000,
  settings: 700,
  login: 900,
  profile: 1400,
  directory: 1700,
  msn: 1200,
  radio: 2200,
};

const LOADING_MESSAGES = [
  "Lecture du disque dur...",
  "Chargement des ressources...",
  "Initialisation du programme...",
  "Vérification de la mémoire...",
  "Chargement des DLL manquantes...",
  "Négociation avec le matériel...",
  "Application des rustines...",
  "Décompression des données...",
  "Chargement en cours...",
  "Presque prêt... (vraiment)",
];

function AppLoadingScreen({ appSlug, onDone }: { appSlug: string; onDone: () => void }) {
  const slugKey = appSlug.startsWith("profile:") ? "profile" : appSlug;
  const duration = LOAD_DURATIONS[slugKey] ?? 2000;
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [hourglassFlipped, setHourglassFlipped] = useState(false);
  const { startAccessDisk, stopAccessDisk } = useSoundContext();
  const doneRef = useRef(false);

  useEffect(() => {
    const totalSteps = Math.floor(duration / 120);
    let step = 0;

    // Son HDD continu pendant tout le chargement
    startAccessDisk();
    const hddIntervals: ReturnType<typeof setTimeout>[] = [];

    // Sablier qui se retourne toutes les 600ms
    const hourglassId = setInterval(() => {
      setHourglassFlipped((v) => !v);
    }, 600);

    // Progression non-linéaire : rapide au début, ralentit vers 90%, finit vite
    const tickId = setInterval(() => {
      step++;
      const raw = step / totalSteps;
      // Courbe : accélère, stagne, finit
      const eased = raw < 0.7
        ? raw * 1.1
        : raw < 0.9
        ? 0.77 + (raw - 0.7) * 0.4
        : 0.85 + (raw - 0.9) * 1.5;
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      // Change le message tous les ~20% environ
      const newMsgIdx = Math.floor((pct / 100) * (LOADING_MESSAGES.length - 1));
      setMsgIndex(Math.min(newMsgIdx, LOADING_MESSAGES.length - 1));

      if (step >= totalSteps) {
        clearInterval(tickId);
        clearInterval(hourglassId);
        hddIntervals.forEach(clearTimeout);
        setProgress(100);
        doneRef.current = true;
        stopAccessDisk();
        setTimeout(onDone, 300);
      }
    }, duration / totalSteps);

    return () => {
      doneRef.current = true;
      clearInterval(tickId);
      clearInterval(hourglassId);
      hddIntervals.forEach(clearTimeout);
      stopAccessDisk();
    };
  }, [duration, onDone, startAccessDisk, stopAccessDisk]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-5 select-none"
      style={{
        background: "var(--t-bg)",
        minHeight: 200,
        fontFamily: "var(--t-font-display)",
      }}
    >
      {/* Sablier animé */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="text-6xl"
          style={{
            display: "inline-block",
            transform: hourglassFlipped ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.3))",
          }}
        >
          ⏳
        </span>
        <div
          className="text-base tracking-widest"
          style={{ color: "var(--t-text-muted)" }}
        >
          {LOADING_MESSAGES[msgIndex]}
        </div>
      </div>

      {/* Barre de progression Win95 */}
      <div className="w-64 flex flex-col gap-1">
        <div
          style={{
            border: "2px solid",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
            height: 20,
            padding: 2,
            background: "var(--t-bg)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "repeating-linear-gradient(90deg, var(--t-accent) 0px, var(--t-accent) 8px, var(--t-titlebar-to, #1084d0) 8px, var(--t-titlebar-to, #1084d0) 10px)",
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <div
          className="text-sm tracking-widest text-center tabular-nums"
          style={{ color: "var(--t-text-muted)" }}
        >
          {progress}%
        </div>
      </div>

      {/* Curseur sablier old school — texte clignotant */}
      <div
        className="text-sm tracking-widest animate-[blink_1s_step-end_infinite]"
        style={{ color: "var(--t-text-subtle)" }}
      >
        Veuillez patienter...
      </div>
    </div>
  );
}

function WindowContent({ win }: { win: { id: string; appSlug: string } }) {
  const { closeWindow } = useWindowManager();
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return <AppLoadingScreen appSlug={win.appSlug} onDone={() => setLoaded(true)} />;
  }

  if (win.appSlug === "plouf-plouf") {
    return (
      <div
        className="min-h-full relative"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(173,216,255,0.25) 0%, transparent 50%), linear-gradient(180deg, var(--t-page-from) 0%, var(--t-page-to) 100%)",
        }}
      >
        <PloufApp embedded />
      </div>
    );
  }

  if (win.appSlug === "settings") {
    return (
      <div className="relative">
        <SettingsPanel onClose={() => closeWindow(win.id)} embedded />
      </div>
    );
  }

  if (win.appSlug === "login") {
    return <LoginWindow onClose={() => closeWindow(win.id)} />;
  }

  // profile:<username> — public profile viewer
  if (win.appSlug.startsWith("profile:")) {
    const username = win.appSlug.slice("profile:".length);
    return <PublicProfileApp username={username} />;
  }

  const Component = APP_COMPONENTS[win.appSlug];
  return Component ? <Component /> : null;
}

export function WindowLayer() {
  const { windows } = useWindowManager();

  return (
    <>
      {windows.map((win) => {
        if (win.state === "minimized") return null;
        return (
          <OsWindow key={win.id} win={win}>
            <WindowContent win={win} />
          </OsWindow>
        );
      })}
    </>
  );
}
