"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { signIn, signUp } from "@/lib/auth-client";
import { useAuth } from "@/lib/contexts/auth-context";
import { useWindowActions } from "@/lib/contexts/window-manager-context";
import type { AppProps } from "@/types";

type Mode = "login" | "register";

const loginSchema = z.object({
  username: z.string().min(2, "Pseudo trop court. Même GUEST fait 5 lettres."),
  password: z.string().min(1, "Le mot de passe ne peut pas être vide, voyons."),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Votre pseudo doit faire au moins 2 caractères. Soyez créatif.")
    .max(32, "32 caractères max. GunthOS n'est pas un roman.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Lettres, chiffres, _ et - uniquement. Pas de @#$%."),
  password: z.string().min(1, "Le mot de passe ne peut pas être vide, voyons."),
});

const LOGIN_HINTS = [
  "Mot de passe oublié ? Parlez à votre thérapeute, pas à nous.",
  "Conseil : n'utilisez pas '123456'. (On sait que vous y avez pensé.)",
  "Votre session expire après 30 jours ou une coupure de courant.",
  "Connexion sécurisée par certificat auto-signé — Gunth Corp SAS, Roubaix, 2003.",
  "Connexion sécurisée par GUNTH-SSL™ (certifié par nous-mêmes).",
  "Mot de passe perdu ? Vos données sont en lieu sûr. (Emplacement inconnu depuis 2003.)",
  "Astuce : un bon mot de passe contient au moins un chiffre et une larme.",
  "RGPD : vos données sont traitées selon le CLUF GunthOS §47.3.b (annexe non disponible).",
  "Astuce avancée : votre navigateur a mémorisé votre mot de passe. Lui, il s'en souvient.",
];

function getHint() {
  return LOGIN_HINTS[Math.floor(Math.random() * LOGIN_HINTS.length)]!;
}

export function LoginApp({ windowId }: AppProps) {
  const { user, logout } = useAuth();
  const { closeWindow } = useWindowActions();
  const onClose = () => closeWindow(windowId);

  const [mode, setMode] = useState<Mode>("login");
  const [hint] = useState(getHint);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearForm = () => { setUsername(""); setPassword(""); setError(null); setSuccessMsg(null); };

  const handleLogin = useCallback(async () => {
    setError(null);
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Données invalides"); return; }
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (signIn as any).username({ username, password });
      if (result.error) setError("Identifiants incorrects. Réessayez ou inventez-en de nouveaux.");
    } catch {
      setError("Erreur réseau. Le modem 14.4k a encore lâché.");
    } finally {
      setLoading(false);
    }
  }, [username, password]);

  const handleRegister = useCallback(async () => {
    setError(null);
    const parsed = registerSchema.safeParse({ username, password });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Données invalides"); return; }
    setLoading(true);
    try {
      const fakeEmail = `${username.toLowerCase()}@gunth.local`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (signUp as any).email({ email: fakeEmail, password, name: username, username });
      if (result.error) {
        setError("Impossible de créer le compte. Peut-être que l'univers s'y oppose.");
      } else {
        setSuccessMsg("Compte créé ! Bienvenue dans GunthOS. Vous êtes maintenant officiel(le).");
        clearForm();
        setMode("login");
      }
    } catch {
      setError("Erreur réseau. Soufflez dans la cartouche et réessayez.");
    } finally {
      setLoading(false);
    }
  }, [username, password]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) mode === "login" ? handleLogin() : handleRegister();
  };

  if (user) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-5 p-6 select-none"
        style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)", background: "var(--t-bg)" }}
      >
        <div className="text-6xl">✅</div>

        <div
          className="flex flex-col items-center gap-2 px-6 py-4 border-2 text-center"
          style={{
            borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
            borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
            background: "var(--t-app-bg, #fff)",
            maxWidth: 300,
          }}
        >
          <div style={{ fontSize: "var(--t-text-base)" }}>{user.name}</div>
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted, #666)" }}>
            Connecté à GunthOS™
          </div>
          <div style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle, #999)" }}>
            (Enfin, autant que peut l&apos;être un OS de 1998.)
          </div>
        </div>

        <div className="flex gap-2">
          <RetroButton onClick={logout} variant="danger">🔌 Se déconnecter</RetroButton>
          <RetroButton onClick={onClose} variant="secondary">✕ Fermer</RetroButton>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "var(--t-font-display)", color: "var(--t-text)", background: "var(--t-bg)" }}
    >
      {/* Header avec logo */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b-2"
        style={{ borderColor: "var(--t-border-dark)", background: "var(--t-titlebar-from, var(--t-accent))" }}
      >
        <div className="text-2xl">🔐</div>
        <div className="flex flex-col">
          <div
            className="tracking-widest"
            style={{ fontSize: "var(--t-text-sm)", color: "#fff", textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}
          >
            GUNTH-OS SECURE LOGIN v2.1
          </div>
          <div style={{ fontSize: "var(--t-text-xs)", color: "rgba(255,255,255,0.75)" }}>
            Identification requise pour continuer
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 px-2 pt-2" style={{ borderColor: "var(--t-border-dark)" }}>
        <TabButton active={mode === "login"} onClick={() => { setMode("login"); clearForm(); }}>🔑 Connexion</TabButton>
        <TabButton active={mode === "register"} onClick={() => { setMode("register"); clearForm(); }}>📝 Inscription</TabButton>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">

        {successMsg && (
          <StatusBox variant="success">✅ {successMsg}</StatusBox>
        )}
        {error && (
          <StatusBox variant="error">⚠ {error}</StatusBox>
        )}

        <FieldGroup label="IDENTIFIANT.SYS">
          <RetroInput
            type="text"
            placeholder="votre_pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="username"
          />
        </FieldGroup>

        <FieldGroup label="MOT_DE_PASSE.EXE">
          <RetroInput
            type="password"
            placeholder={mode === "register" ? "Choisissez un mot de passe" : "••••••••"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </FieldGroup>

        {mode === "register" && (
          <div
            className="px-3 py-2 border-l-4"
            style={{
              fontSize: "var(--t-text-xs)",
              borderLeftColor: "var(--t-accent, #000080)",
              color: "var(--t-text-muted, #666)",
              background: "var(--t-app-bg, #f8f8f8)",
            }}
          >
            📋 Règles du pseudo : lettres, chiffres, _ et - uniquement.
          </div>
        )}

        <div className="flex gap-2 mt-1">
          <RetroButton
            onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading}
            variant="primary"
          >
            {loading
              ? "⏳ Vérification en cours…"
              : mode === "login" ? "🔑 Connexion" : "📝 Créer le compte"}
          </RetroButton>
          <RetroButton onClick={onClose} disabled={loading} variant="secondary">
            👤 Mode invité
          </RetroButton>
        </div>

        {/* Hint + footer */}
        <div className="flex flex-col gap-1 mt-auto pt-3 border-t" style={{ borderColor: "var(--t-border-dark)" }}>
          <div
            className="tracking-wide px-2 py-1 border-l-4"
            style={{
              fontSize: "var(--t-text-xs)",
              borderLeftColor: "var(--t-border-dark)",
              color: "var(--t-text-muted, #808080)",
            }}
          >
            💡 {hint}
          </div>
          <div
            className="tracking-wide px-2"
            style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-subtle, #aaa)" }}
          >
            Mode invité : vos paramètres restent en local, comme en 1998.
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 tracking-widest cursor-pointer border-t-2 border-x-2 -mb-0.5 select-none"
      style={{
        fontSize: "var(--t-text-sm)",
        fontFamily: "var(--t-font-display)",
        color: "var(--t-text)",
        backgroundColor: active ? "var(--t-bg)" : "var(--t-bg-dark, #a0a0a0)",
        borderTopColor: active ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderLeftColor: active ? "var(--t-border-light)" : "var(--t-border-dark)",
        borderRightColor: active ? "var(--t-border-dark)" : "var(--t-border-light)",
        borderBottomColor: active ? "var(--t-bg)" : "var(--t-border-dark)",
        zIndex: active ? 1 : 0,
        position: "relative",
      }}
    >
      {children}
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="tracking-widest select-none"
        style={{ fontSize: "var(--t-text-xs)", color: "var(--t-text-muted, #666)", fontFamily: "var(--t-font-display)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusBox({ variant, children }: { variant: "success" | "error"; children: React.ReactNode }) {
  const isError = variant === "error";
  return (
    <div
      className="tracking-wide px-3 py-2 border-2"
      style={{
        fontSize: "var(--t-text-sm)",
        fontFamily: "var(--t-font-display)",
        borderColor: isError ? "#c0392b" : "var(--t-accent, #000080)",
        backgroundColor: isError ? "#fff0f0" : "var(--t-app-bg, #fff)",
        color: isError ? "#c0392b" : "var(--t-accent, #000080)",
      }}
    >
      {children}
    </div>
  );
}

function RetroInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-2 py-1 border-2 outline-none"
      style={{
        fontSize: "var(--t-text-base)",
        fontFamily: "var(--t-font-display)",
        color: "var(--t-text)",
        backgroundColor: "var(--t-app-bg, #fff)",
        borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
        borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)",
        ...props.style,
      }}
    />
  );
}

function RetroButton({ onClick, children, disabled, variant = "secondary" }: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const bg =
    variant === "primary"
      ? "linear-gradient(180deg, var(--t-bg-light, #e0e0e0) 0%, var(--t-bg, #c0c0c0) 50%, var(--t-bg-dark, #a0a0a0) 100%)"
      : variant === "danger"
      ? "linear-gradient(180deg, #e88, #c44)"
      : "var(--t-bg)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-1 border-2 tracking-widest cursor-pointer select-none shrink-0"
      style={{
        fontSize: "var(--t-text-sm)",
        fontFamily: "var(--t-font-display)",
        color: variant === "danger" ? "#fff" : "var(--t-text)",
        background: bg,
        borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
        borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
