"use client";

import { useState } from "react";
import { pickRandom } from "@/lib/gunth-jokes";
import type { AppProps } from "@/types";

const IE_ERRORS = [
  "Cette page ne peut pas être affichée.",
  "Connexion au serveur expirée. Reconnectez le câble RJ-45.",
  "Erreur ActiveX : composant manquant. Voulez-vous l'installer ? (Ne cliquez pas Oui)",
  "Le certificat de sécurité a expiré en 2004.",
  "Macromedia Flash Player requis. Version 2.0 minimum.",
  "Erreur de script ligne 1 : \"Internet\" is not defined.",
  "Avertissement : ce site utilise des cookies. Des vrais. Au chocolat.",
];

const FAKE_SITES = [
  { url: "http://www.google.com", joke: "Connexion refusée. Google n'existait pas encore." },
  { url: "http://www.yahoo.fr", joke: "Vous avez 4 728 nouveaux e-mails non lus." },
  { url: "http://www.msn.com", joke: "MSN Messenger : vos 47 contacts sont hors ligne." },
  { url: "http://www.gunthcorp.net", joke: "404 — GunthCorp a déménagé. Adresse inconnue." },
  { url: "http://www.jeuxvideo.com", joke: "Page chargée à 34%. Abandon recommandé." },
];

export function IEApp(_: AppProps) {
  const [url, setUrl] = useState("http://www.gunthcorp.net");
  const [inputUrl, setInputUrl] = useState("http://www.gunthcorp.net");
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [visitedSite, setVisitedSite] = useState<(typeof FAKE_SITES)[0] | null>(null);

  function navigate(target?: string) {
    const dest = target ?? inputUrl;
    setUrl(dest);
    setInputUrl(dest);
    setError(null);
    setVisitedSite(null);
    setLoading(true);
    setLoadProgress(0);

    const interval = setInterval(() => {
      setLoadProgress((p) => {
        const next = p + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setLoading(false);
          const known = FAKE_SITES.find((s) => dest.includes(new URL(s.url).hostname));
          if (known) {
            setVisitedSite(known);
          } else {
            setError(pickRandom(IE_ERRORS)!);
          }
          return 100;
        }
        return next;
      });
    }, 120);
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "var(--t-font-display)" }}>
      <div
        className="flex gap-1 px-2 py-1 border-b shrink-0 items-center"
        style={{ borderColor: "var(--t-border-dark)", backgroundColor: "var(--t-bg)" }}
      >
        {["◀", "▶", "🔄", "🏠"].map((btn) => (
          <button
            key={btn}
            className="w-7 h-7 border-[2px] text-sm flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: "var(--t-bg)",
              color: "var(--t-text)",
              borderTopColor: "var(--t-border-light)",
              borderLeftColor: "var(--t-border-light)",
              borderBottomColor: "var(--t-border-dark)",
              borderRightColor: "var(--t-border-dark)",
            }}
            onClick={btn === "🏠" ? () => navigate("http://www.gunthcorp.net") : btn === "🔄" ? () => navigate() : undefined}
          >
            {btn}
          </button>
        ))}

        <input
          className="flex-1 px-2 py-0.5 text-sm border-[2px] outline-none mx-1"
          style={{
            backgroundColor: "var(--t-app-bg)",
            color: "var(--t-app-text)",
            fontFamily: "var(--t-font-mono)",
            borderTopColor: "var(--t-border-dark)",
            borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)",
            borderRightColor: "var(--t-border-light)",
          }}
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate()}
        />
        <button
          className="px-3 py-0.5 border-[2px] text-sm tracking-widest cursor-pointer"
          style={{
            backgroundColor: "var(--t-bg)",
            color: "var(--t-text)",
            borderTopColor: "var(--t-border-light)",
            borderLeftColor: "var(--t-border-light)",
            borderBottomColor: "var(--t-border-dark)",
            borderRightColor: "var(--t-border-dark)",
          }}
          onClick={() => navigate()}
        >
          OK
        </button>
      </div>

      {loading && (
        <div className="h-1 shrink-0" style={{ backgroundColor: "var(--t-bg-dark)" }}>
          <div
            className="h-full"
            style={{ width: `${loadProgress}%`, backgroundColor: "var(--t-accent)", transition: "width 0.1s" }}
          />
        </div>
      )}

      <div
        className="flex-1 flex items-center justify-center p-6 text-center"
        style={{ backgroundColor: "var(--t-app-bg)", color: "var(--t-app-text)" }}
      >
        {loading ? (
          <div style={{ fontFamily: "var(--t-font-mono)", fontSize: "0.875rem", color: "var(--t-accent)" }}>
            Connexion à {url}…<br />
            <span style={{ fontSize: "0.75rem", color: "var(--t-text-muted)" }}>
              {Math.floor(loadProgress)}% chargé — ne cliquez pas ailleurs
            </span>
          </div>
        ) : error ? (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🚫</div>
            <div style={{ fontFamily: "var(--t-font-display)", fontSize: "1.1rem", fontWeight: "bold", color: "var(--t-accent)", marginBottom: 6 }}>
              Cette page ne peut pas être affichée
            </div>
            <div style={{ fontFamily: "var(--t-font-mono)", fontSize: "0.75rem", color: "var(--t-app-text-muted)", maxWidth: 280 }}>
              {error}
            </div>
            <div style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--t-text-subtle)" }}>
              Internet Explorer 6.0 — GunthOS Edition
            </div>
            <div className="flex gap-2 justify-center mt-4">
              {FAKE_SITES.slice(0, 3).map((s) => (
                <button
                  key={s.url}
                  onClick={() => navigate(s.url)}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--t-accent)",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--t-font-display)",
                  }}
                >
                  {new URL(s.url).hostname}
                </button>
              ))}
            </div>
          </div>
        ) : visitedSite ? (
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--t-accent)", fontFamily: "var(--t-font-display)", marginBottom: 8 }}>
              {visitedSite.url}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--t-app-text-muted)", fontFamily: "var(--t-font-display)", marginBottom: 16 }}>
              {visitedSite.joke}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--t-text-subtle)" }}>
              🔒 Ce site est certifié sécurisé par GunthCert™ (certificat expiré)
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="px-2 py-0.5 text-xs tracking-widest border-t shrink-0 flex justify-between"
        style={{
          borderColor: "var(--t-border-dark)",
          color: "var(--t-text-muted)",
          backgroundColor: "var(--t-bg)",
        }}
      >
        <span>{loading ? `Connexion à ${url}…` : error ? "Erreur" : "Terminé"}</span>
        <span>🌐 Zone Internet</span>
      </div>
    </div>
  );
}
