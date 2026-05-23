"use client";

import { useState, useEffect, useRef, Component, Suspense, type ReactNode, type ErrorInfo } from "react";
import { useWindowState, useWindowActions } from "@/lib/contexts/window-manager-context";
import { getAppManifest } from "@/apps";
import { OsWindow } from "./os-window";
import { useSoundContext } from "@/lib/contexts/sound-context";
import { useSettingsState } from "@/lib/contexts/settings-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { useOpenApp } from "@/lib/hooks/use-open-app";
import { useChatWindows } from "@/lib/contexts/chat-windows-context";
import { ChatWindowContent, GroupChatWindowContent } from "@/apps/msn";

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-3 p-6 select-none"
          style={{ background: "var(--t-bg)", fontFamily: "var(--t-font-display)" }}
        >
          <div className="text-4xl">💀</div>
          <div className="text-base" style={{ color: "var(--t-text)" }}>Cette application a planté.</div>
          <pre
            className="text-xs max-w-xs overflow-auto p-2"
            style={{ background: "var(--t-bg-dark)", color: "var(--t-text-muted)", borderRadius: 2 }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const manifest = getAppManifest(appSlug);
  const { settings } = useSettingsState();
  const baseDuration = manifest?.loadDuration ?? 1500;
  const duration = settings.performanceModeEnabled ? Math.floor(baseDuration / 6) : baseDuration;
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [hourglassFlipped, setHourglassFlipped] = useState(false);
  const { startAccessDisk, stopAccessDisk } = useSoundContext();
  const doneRef = useRef(false);

  useEffect(() => {
    const totalSteps = Math.floor(duration / 120);
    let step = 0;

    startAccessDisk();

    const hourglassId = setInterval(() => {
      setHourglassFlipped((v) => !v);
    }, 600);

    const tickId = setInterval(() => {
      step++;
      const raw = step / totalSteps;
      const eased = raw < 0.7
        ? raw * 1.1
        : raw < 0.9
        ? 0.77 + (raw - 0.7) * 0.4
        : 0.85 + (raw - 0.9) * 1.5;
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      const newMsgIdx = Math.floor((pct / 100) * (LOADING_MESSAGES.length - 1));
      setMsgIndex(Math.min(newMsgIdx, LOADING_MESSAGES.length - 1));

      if (step >= totalSteps) {
        clearInterval(tickId);
        clearInterval(hourglassId);
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
      stopAccessDisk();
    };
  }, [duration, onDone, startAccessDisk, stopAccessDisk]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-5 select-none"
      style={{ background: "var(--t-bg)", minHeight: 200, fontFamily: "var(--t-font-display)" }}
    >
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
        <div className="text-base tracking-widest" style={{ color: "var(--t-text-muted)" }}>
          {LOADING_MESSAGES[msgIndex]}
        </div>
      </div>

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

      <div
        className="text-sm tracking-widest animate-[blink_1s_step-end_infinite]"
        style={{ color: "var(--t-text-subtle)" }}
      >
        Veuillez patienter...
      </div>
    </div>
  );
}

const AUTH_WALL_MESSAGES = [
  "Accès refusé. Qui êtes-vous, d'abord ?",
  "Cette zone est réservée aux utilisateurs enregistrés. Ou aux fantômes avec un compte.",
  "ERREUR 401 : identité non vérifiée. Essayez d'exister d'abord.",
  "Contenu protégé par GUNTH-LOCK™. Brevet déposé en 1997.",
];

function AuthWall({ appName }: { appName: string }) {
  const { openApp } = useOpenApp();
  const [msgIndex] = useState(() => Math.floor(Math.random() * AUTH_WALL_MESSAGES.length));

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-5 p-6 select-none"
      style={{ background: "var(--t-bg)", fontFamily: "var(--t-font-display)", color: "var(--t-text)" }}
    >
      <div className="text-5xl">🔒</div>

      <div
        className="flex flex-col items-center gap-1 text-center px-4 py-3 border-2"
        style={{
          borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
          borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
          background: "var(--t-app-bg, #fff)",
          maxWidth: 320,
        }}
      >
        <div style={{ fontSize: "var(--t-text-sm)", color: "var(--t-text)" }}>
          ⛔ Accès à <strong>{appName}</strong> refusé
        </div>
        <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted, #808080)", marginTop: 4 }}>
          {AUTH_WALL_MESSAGES[msgIndex]}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => openApp("login")}
          className="px-5 py-1.5 border-2 tracking-widest cursor-pointer"
          style={{
            fontSize: "var(--t-text-sm)",
            fontFamily: "var(--t-font-display)",
            color: "var(--t-text)",
            background: "linear-gradient(180deg, var(--t-bg-light, #e0e0e0) 0%, var(--t-bg, #c0c0c0) 50%, var(--t-bg-dark, #a0a0a0) 100%)",
            borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
          }}
        >
          🔑 Se connecter
        </button>
        <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted, #999)" }}>
          Mode invité : certaines apps restent inaccessibles. C&apos;est la vie.
        </div>
      </div>
    </div>
  );
}

function ChatWindowWrapper({ win }: { win: { id: string; appSlug: string } }) {
  const { getChat, myAvatar } = useChatWindows();
  const { user } = useAuth();
  const { closeWindow } = useWindowActions();

  if (!user) return null;
  const entry = getChat(win.appSlug);
  if (!entry) return <div style={{ padding: 16, fontFamily: "var(--t-font-display)", color: "var(--t-text-muted)" }}>Conversation introuvable</div>;

  if (entry.kind === "dm") {
    return (
      <ChatWindowContent
        contact={entry.contact}
        myId={user.id}
        myAvatar={myAvatar}
        onClose={() => closeWindow(win.id)}
      />
    );
  }

  return (
    <GroupChatWindowContent
      group={entry.group}
      myId={user.id}
      myAvatar={myAvatar}
      onClose={() => closeWindow(win.id)}
    />
  );
}

function WindowContent({ win }: { win: { id: string; appSlug: string } }) {
  const [loaded, setLoaded] = useState(false);
  const { user, isPending } = useAuth();

  // Chat and group windows bypass the app registry
  if (win.appSlug.startsWith("chat:") || win.appSlug.startsWith("group:")) {
    return <ChatWindowWrapper win={win} />;
  }

  const manifest = getAppManifest(win.appSlug);
  const AppComponent = manifest?.component;

  if (!loaded) {
    return <AppLoadingScreen appSlug={win.appSlug} onDone={() => setLoaded(true)} />;
  }

  if (!AppComponent) return null;

  if (manifest?.requiresAuth && !isPending && !user) {
    return <AuthWall appName={manifest.name} />;
  }

  return (
    <AppErrorBoundary>
      <Suspense fallback={null}>
        <AppComponent windowId={win.appSlug.startsWith("profile:") ? win.appSlug : win.id} />
      </Suspense>
    </AppErrorBoundary>
  );
}

export function WindowLayer() {
  const { windows } = useWindowState();

  return (
    <>
      {windows.map((win) => (
        <OsWindow key={win.id} win={win}>
          <WindowContent win={win} />
        </OsWindow>
      ))}
    </>
  );
}
