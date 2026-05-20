"use client";

import dynamic from "next/dynamic";
import { useWindowManager } from "@/lib/contexts/window-manager-context";
import { OsWindow } from "./os-window";
import { SettingsPanel } from "./settings-panel";

const PloufApp = dynamic(
  () =>
    import("@/components/plouf-plouf/plouf-app").then((m) => ({
      default: m.PloufApp,
    })),
  { ssr: false }
);

function MyComputerContent() {
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
          style={{
            color: "var(--t-accent)",
            fontFamily: "var(--t-font-display)",
          }}
        >
          MON ORDINATEUR
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "💾", label: "Disque C:\\" },
          { icon: "💿", label: "Lecteur D:\\" },
          { icon: "🖨️", label: "Imprimante" },
          { icon: "📂", label: "Mes Documents" },
          { icon: "🌐", label: "Internet" },
          { icon: "🕹️", label: "Jeux" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 p-3 cursor-default hover:opacity-80"
          >
            <span className="text-4xl">{item.icon}</span>
            <span
              className="text-xs text-center tracking-wider"
              style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div
        className="mt-4 text-center text-xs tracking-wider py-2 border-t"
        style={{
          color: "var(--t-text-muted)",
          fontFamily: "var(--t-font-display)",
          borderTopColor: "var(--t-border-dark)",
        }}
      >
        🚧 Système d'exploitation Gunthos v1.0 — 640 Ko de RAM libres 🚧
      </div>
    </div>
  );
}

export function WindowLayer() {
  const { windows, closeWindow } = useWindowManager();

  return (
    <>
      {windows.map((win) => {
        if (win.state === "minimized") return null;

        let content: React.ReactNode = null;

        if (win.appSlug === "plouf-plouf") {
          content = (
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
        } else if (win.appSlug === "settings") {
          content = (
            <div className="relative">
              <SettingsPanel onClose={() => closeWindow(win.id)} embedded />
            </div>
          );
        } else if (win.appSlug === "my-computer") {
          content = <MyComputerContent />;
        }

        return (
          <OsWindow key={win.id} win={win}>
            {content}
          </OsWindow>
        );
      })}
    </>
  );
}
